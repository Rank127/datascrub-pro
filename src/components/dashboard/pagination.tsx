"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const [inputValue, setInputValue] = useState(page.toString());

  // Sync input with page prop
  useEffect(() => {
    setInputValue(page.toString());
  }, [page]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const newPage = parseInt(inputValue, 10);
      if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
        onPageChange(newPage);
      } else {
        setInputValue(page.toString());
      }
    }
  };

  const handleInputBlur = () => {
    const newPage = parseInt(inputValue, 10);
    if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    } else {
      setInputValue(page.toString());
    }
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Max page buttons to show

    if (totalPages <= showPages + 2) {
      // Show all pages if few enough
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      // Adjust if at edges
      if (page <= 3) {
        end = Math.min(showPages, totalPages - 1);
      } else if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - showPages + 1);
      }

      // Add ellipsis if needed
      if (start > 2) pages.push("...");

      // Add middle pages
      for (let i = start; i <= end; i++) pages.push(i);

      // Add ellipsis if needed
      if (end < totalPages - 1) pages.push("...");

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {/* First page */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={page === 1}
        className="border-slate-600 hidden sm:flex"
        title="First page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      {/* Previous page */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="border-slate-600"
        title="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {getPageNumbers().map((p, idx) =>
          typeof p === "number" ? (
            <Button
              key={idx}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p)}
              className={
                p === page
                  ? "bg-emerald-600 hover:bg-emerald-700 min-w-[36px]"
                  : "border-slate-600 min-w-[36px]"
              }
            >
              {p}
            </Button>
          ) : (
            <span key={idx} className="text-slate-500 px-1">
              {p}
            </span>
          )
        )}
      </div>

      {/* Page input for mobile and direct access */}
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-sm text-slate-400 sm:hidden">Page</span>
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="w-14 h-8 text-center bg-slate-700/50 border-slate-600 text-sm"
          title="Type page number and press Enter"
        />
        <span className="text-sm text-slate-400">of {totalPages}</span>
      </div>

      {/* Next page */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="border-slate-600"
        title="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last page */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={page === totalPages}
        className="border-slate-600 hidden sm:flex"
        title="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
