
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, FileText, BookOpen, Target, ArrowLeft, Zap, SkipBack, SkipForward, Download } from "lucide-react";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { downloadPDF } from "@/utils/pdfUtils";
import { toast } from "sonner";

interface PageAnalysis {
  pageNumber: number;
  keyPoints: string[];
  studyPoints: Array<{
    title: string;
    description: string;
    importance: "high" | "medium" | "low";
    tnpscRelevance: string;
  }>;
  summary: string;
  tnpscRelevance: string;
}

interface ComprehensivePdfResultsProps {
  pageAnalyses: PageAnalysis[];
  overallSummary: string;
  totalKeyPoints: string[];
  onReset: () => void;
  onGenerateQuestions: (startPage: number, endPage: number) => void;
  onGenerateNextPage?: (pageNumber: number) => void;
  isGeneratingQuestions: boolean;
  totalPdfPages?: number;
}

const ComprehensivePdfResults = ({
  pageAnalyses,
  overallSummary,
  totalKeyPoints,
  onReset,
  onGenerateQuestions,
  onGenerateNextPage,
  isGeneratingQuestions,
  totalPdfPages = 0
}: ComprehensivePdfResultsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRange, setSelectedRange] = useState({ start: 1, end: Math.min(10, pageAnalyses.length) });
  const [isGeneratingPage, setIsGeneratingPage] = useState(false);
  const totalPages = pageAnalyses.length;

  const currentAnalysis = pageAnalyses[currentPage - 1];

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleGenerateQuestions = () => {
    onGenerateQuestions(selectedRange.start, selectedRange.end);
  };

  const handleGenerateNextPage = async () => {
    if (!onGenerateNextPage || !currentAnalysis) return;
    
    const nextPageNumber = currentAnalysis.pageNumber + 1;
    console.log(`Generating next page: ${nextPageNumber}, Total PDF pages: ${totalPdfPages}`);
    
    if (nextPageNumber > totalPdfPages) {
      toast.error("No more pages available");
      return;
    }

    // Check if page already exists
    const existingPageIndex = pageAnalyses.findIndex(p => p.pageNumber === nextPageNumber);
    if (existingPageIndex !== -1) {
      setCurrentPage(existingPageIndex + 1);
      toast.info(`Page ${nextPageNumber} already analyzed. Navigating to it.`);
      return;
    }

    setIsGeneratingPage(true);
    try {
      console.log(`Calling onGenerateNextPage for page ${nextPageNumber}`);
      await onGenerateNextPage(nextPageNumber);
      
      // Wait a bit for the state to update, then find the new page
      setTimeout(() => {
        const newPageIndex = pageAnalyses.findIndex(p => p.pageNumber === nextPageNumber);
        if (newPageIndex !== -1) {
          setCurrentPage(newPageIndex + 1);
          toast.success(`Page ${nextPageNumber} analysis completed!`);
        } else {
          toast.error(`Failed to generate analysis for page ${nextPageNumber}`);
        }
      }, 500);
    } catch (error) {
      console.error(`Error generating page ${nextPageNumber}:`, error);
      toast.error(`Failed to generate page ${nextPageNumber}`);
    } finally {
      setIsGeneratingPage(false);
    }
  };

  const handleGeneratePreviousPage = async () => {
    if (!onGenerateNextPage || !currentAnalysis) return;
    
    const previousPageNumber = currentAnalysis.pageNumber - 1;
    console.log(`Generating previous page: ${previousPageNumber}`);
    
    if (previousPageNumber < 1) {
      toast.error("This is the first page");
      return;
    }
    
    // Check if page already exists
    const existingPageIndex = pageAnalyses.findIndex(p => p.pageNumber === previousPageNumber);
    if (existingPageIndex !== -1) {
      setCurrentPage(existingPageIndex + 1);
      toast.info(`Page ${previousPageNumber} already analyzed. Navigating to it.`);
      return;
    }

    setIsGeneratingPage(true);
    try {
      console.log(`Calling onGenerateNextPage for page ${previousPageNumber}`);
      await onGenerateNextPage(previousPageNumber);
      
      // Wait a bit for the state to update, then find the new page
      setTimeout(() => {
        const newPageIndex = pageAnalyses.findIndex(p => p.pageNumber === previousPageNumber);
        if (newPageIndex !== -1) {
          setCurrentPage(newPageIndex + 1);
          toast.success(`Page ${previousPageNumber} analysis completed!`);
        } else {
          toast.error(`Failed to generate analysis for page ${previousPageNumber}`);
        }
      }, 500);
    } catch (error) {
      console.error(`Error generating page ${previousPageNumber}:`, error);
      toast.error(`Failed to generate page ${previousPageNumber}`);
    } finally {
      setIsGeneratingPage(false);
    }
  };

  const handleDownloadAnalysis = async () => {
    try {
      if (!currentAnalysis) {
        toast.error("No analysis available to download");
        return;
      }

      console.log("Downloading analysis for page:", currentAnalysis.pageNumber);
      console.log("Analysis data:", currentAnalysis);

      const analysisData = {
        fileName: `Page ${currentAnalysis.pageNumber} Analysis`,
        summary: currentAnalysis.summary || "No summary available",
        keyPoints: currentAnalysis.keyPoints || [],
        tnpscRelevance: currentAnalysis.tnpscRelevance || "No TNPSC relevance information",
        studyPoints: currentAnalysis.studyPoints || [],
        tnpscCategories: [] // Can be extended if needed
      };

      await downloadPDF({
        title: `Page ${currentAnalysis.pageNumber} - TNPSC Analysis`,
        content: [analysisData],
        type: 'analysis'
      });

      toast.success("Analysis downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download analysis");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Comprehensive PDF Analysis
                </h1>
                <p className="text-gray-600">
                  {totalPages} pages analyzed • {totalKeyPoints.length} key points identified
                </p>
              </div>
            </div>
            <Button onClick={onReset} variant="outline" className="border-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Button>
          </div>

          {/* Overall Summary */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Overall Summary
            </h2>
            <p className="text-gray-700">{overallSummary}</p>
          </Card>

          {/* Quiz Generation Section */}
          <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Generate Practice Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Page
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={selectedRange.start}
                  onChange={(e) => setSelectedRange(prev => ({ 
                    ...prev, 
                    start: Math.max(1, Math.min(parseInt(e.target.value) || 1, totalPages)) 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Page
                </label>
                <input
                  type="number"
                  min={selectedRange.start}
                  max={totalPages}
                  value={selectedRange.end}
                  onChange={(e) => setSelectedRange(prev => ({ 
                    ...prev, 
                    end: Math.max(prev.start, Math.min(parseInt(e.target.value) || prev.start, totalPages)) 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button
                onClick={handleGenerateQuestions}
                disabled={isGeneratingQuestions}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
              >
                {isGeneratingQuestions ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Selected: {selectedRange.end - selectedRange.start + 1} pages (Page {selectedRange.start} to {selectedRange.end})
            </p>
          </Card>

          {/* Page Navigation Controls */}
          {onGenerateNextPage && currentAnalysis && (
            <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SkipForward className="h-5 w-5 text-purple-600" />
                Page Navigation & Generation
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Currently viewing: Page {currentAnalysis.pageNumber} of {totalPdfPages} total pages
                  <br />
                  Analyzed pages: {pageAnalyses.map(p => p.pageNumber).sort((a, b) => a - b).join(', ')}
                </div>
                <Button
                  onClick={handleDownloadAnalysis}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Page Analysis
                </Button>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleGeneratePreviousPage}
                  disabled={isGeneratingPage}
                  variant="outline"
                  size="sm"
                >
                  {isGeneratingPage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <SkipBack className="h-4 w-4" />
                  )}
                  Previous Page
                </Button>
                <Button
                  onClick={handleGenerateNextPage}
                  disabled={isGeneratingPage}
                  variant="outline"
                  size="sm"
                >
                  {isGeneratingPage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  ) : (
                    <SkipForward className="h-4 w-4" />
                  )}
                  Next Page
                </Button>
              </div>
            </Card>
          )}

          {/* Page-wise Analysis */}
          {currentAnalysis && (
            <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Page {currentAnalysis.pageNumber} Analysis
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 px-3">
                    {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-8">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Page Summary</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{currentAnalysis.summary}</p>
                </div>

                {/* TNPSC Relevance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">TNPSC Relevance</h3>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    {currentAnalysis.tnpscRelevance}
                  </p>
                </div>

                {/* Key Points */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Key Points ({currentAnalysis.keyPoints.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentAnalysis.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Points */}
                {currentAnalysis.studyPoints.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Detailed Study Points ({currentAnalysis.studyPoints.length})
                    </h3>
                    <div className="space-y-4">
                      {currentAnalysis.studyPoints.map((point, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-800">{point.title}</h4>
                            <Badge className={`${getImportanceColor(point.importance)} border`}>
                              {point.importance}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{point.description}</p>
                          {point.tnpscRelevance && (
                            <div className="bg-blue-50 p-3 rounded border-l-2 border-blue-400">
                              <p className="text-xs text-blue-700 font-medium mb-1">TNPSC Relevance:</p>
                              <p className="text-xs text-blue-600">{point.tnpscRelevance}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComprehensivePdfResults;
