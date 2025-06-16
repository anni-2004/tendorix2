"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface EmdInfo {
  amount?: number;
  exemption?: boolean;
}

interface Tender {
  _id?: string;
  title: string;
  reference_number?: string;
  business_category?: string[];
  form_url?: string;
  matching_score?: number;
  field_scores?: Record<string, number>;
  eligible?: boolean;
  missing_fields?: Record<string, string>;
  emd?: string | EmdInfo;
}

export default function MatchPage() {
  const router = useRouter();
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [matchingTenders, setMatchingTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [totalTenders, setTotalTenders] = useState(0);
  const [filteredTendersCount, setFilteredTendersCount] = useState(0);

  // 🔐 Load token and company ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setCompanyId(res.data.id);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`; // apply globally
      })
      .catch((err) => {
        console.error("Auth check failed", err);
        router.push("/login");
      });
  }, []);

  const fetchFiltered = async () => {
    setLoading(true);
    setMessage("Filtering tenders...");
    setTenders([]);
    setMatchingTenders([]);
    setIsFiltered(false);
    setFilteredTendersCount(0);
    setTotalTenders(0);

    try {
      const res = await axios.get("http://localhost:8000/match/summary", {
        params: { company_id: companyId },
      });
      const filtered = res.data.filtered_list || [];
      setTenders(filtered);
      setFilteredTendersCount(res.data.filtered_tenders || 0);
      setTotalTenders(res.data.total_tenders || 0);
      setMessage("Filtering complete.");
      setIsFiltered(true);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch filtered tenders.");
    }

    setLoading(false);
  };

  const fetchMatchingScore = async () => {
    if (tenders.length === 0) {
      setMessage("Please filter tenders before matching.");
      return;
    }

    setLoading(true);
    setMessage("Computing matching scores...");
    setMatchingTenders([]);

    try {
      const res = await axios.post("http://localhost:8000/match/match_tenders", {
        company: { _id: companyId },
        filtered_tenders: tenders,
      });
      setMatchingTenders(res.data || []);
      setMessage(`Matched ${res.data.length} tenders.`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to compute matching scores.");
    }

    setLoading(false);
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tender Matching Dashboard</h1>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <input
          type="text"
          value={companyId}
          disabled
          className="border px-3 py-2 rounded w-72 bg-gray-100 text-gray-600"
        />
        <button
          onClick={fetchFiltered}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
        <button
          onClick={fetchMatchingScore}
          disabled={!isFiltered || loading}
          className={`px-4 py-2 rounded text-white ${
            !isFiltered || loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Matching Score
        </button>
      </div>

      {message && <p className="mb-4 text-sm text-blue-700">{message}</p>}

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Filtered Tenders</h2>
        <p className="text-gray-700 mb-2">
          <strong>Total Tenders:</strong> {totalTenders} |{" "}
          <strong>Filtered:</strong> {filteredTendersCount}
        </p>
        {filteredTendersCount === 0 ? (
          <p className="text-gray-500">No filtered tenders found.</p>
        ) : (
          <p className="text-sm text-gray-600">
            Filtered tenders are ready. You can now compute matching scores.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Matched Tenders ({matchingTenders.length})</h2>
        {matchingTenders.length === 0 ? (
          <p className="text-gray-500">No tenders matched the criteria.</p>
        ) : (
          <ul>
            {matchingTenders.map((tender, index) => (
              <li key={index} className="border p-4 rounded mb-3 bg-green-50">
                <h3 className="font-bold">{tender.title}</h3>
                {tender.reference_number && (
                  <p className="text-sm text-gray-600">Ref: {tender.reference_number}</p>
                )}
                <p className="text-sm text-green-800">
                  Match Score: {tender.matching_score?.toFixed(2)}%
                </p>
                {typeof tender.emd === "object" && tender.emd !== null && (
                  <div className="text-sm text-gray-700">
                    <p>EMD Amount: ₹{tender.emd.amount?.toLocaleString() ?? "N/A"}</p>
                    <p>Exemption: {tender.emd.exemption ? "Yes" : "No"}</p>
                  </div>
                )}
                {tender.business_category?.length ? (
                  <p className="text-sm text-gray-600">
                    {tender.business_category.join(", ")}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">No categories</p>
                )}
                {tender.form_url && (
                  <a
                    href={tender.form_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    View Tender Document
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
