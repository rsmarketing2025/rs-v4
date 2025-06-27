
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick: () => void;
  label?: string;
}

export function ExportButton({ onClick, label = "Exportar CSV" }: ExportButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="bg-slate-800 hover:bg-slate-700 border-slate-600 text-white hover:text-white"
    >
      <Download className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}
