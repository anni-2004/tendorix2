import { useState } from "react";
// Update the import path below to the correct location of Button, for example:
import { Button } from "../../components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
import { Skeleton } from "../../components/ui/skeleton";
import { Card, CardContent } from "../../components/ui/card";
// Update the import path below to the correct location of ScrollArea, for example:
import { ScrollArea } from "../../components/ui/scroll-area";

interface Tender {
  _id: string;
  title: string;
  matching_score: number;
  form_url?: string;
}

interface Props {
  companyId: string;
}

export default function TenderMatchingResult({ companyId }: Props) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Tender[] | null>(null);
  const [error, setError] = useState("");

  const handleMatchClick = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_id: companyId }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Matching failed");

      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Tender Matching</h2>
          <Button onClick={handleMatchClick} disabled={loading}>
            {loading ? "Matching..." : "Matching Score"}
          </Button>
        </div>

        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        )}

        {error && <p className="text-red-600">{error}</p>}

        {results && results.length === 0 && (
          <p>No tenders matched the eligibility criteria.</p>
        )}

        {results && results.length > 0 && (
          <ScrollArea className="h-[300px]">
            <table className="w-full text-left border mt-4">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Title</th>
                  <th className="border px-4 py-2">Matching Score</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((tender: Tender) => (
                    <tr key={tender._id}>
                        <td className="border px-4 py-2">{tender.title}</td>
                        <td className="border px-4 py-2">
                            {tender.matching_score.toFixed(2)}%
                        </td>
                        <td className="border px-4 py-2">
                            {tender.form_url ? (
                                <a
                                    href={tender.form_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    View
                                </a>
                            ) : (
                                "N/A"
                            )}
                        </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
