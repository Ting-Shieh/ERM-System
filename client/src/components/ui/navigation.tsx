import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileSpreadsheet, ClipboardCheck, TrendingUp } from "lucide-react";

const Navigation = () => {
  const [location] = useLocation();

  const getDescription = () => {
    switch (location) {
      case "/":
        return "進行2025年度企業風險自評 | Conduct 2025 Annual Enterprise Risk Self-Assessment";
      case "/risk-registry":
        return "查看風險登陸表資料 | View Risk Registry Data";
      case "/registry-assessment":
        return "基於風險登陸表進行自評 | Conduct Assessment Based on Risk Registry";
      default:
        return "企業風險管理系統 | Enterprise Risk Management System";
    }
  };

  return (
    <Card className="mb-6 p-4">
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/">
          <Button 
            variant={location === "/" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              location === "/" 
                ? "bg-[hsl(213,94%,42%)] hover:bg-[hsl(218,100%,34%)]" 
                : "border-[hsl(213,94%,42%)] text-[hsl(213,94%,42%)] hover:bg-[hsl(213,94%,42%)] hover:text-white"
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            風險自評問卷 | Risk Assessment
          </Button>
        </Link>
        
        <Link href="/registry-assessment">
          <Button 
            variant={location === "/registry-assessment" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              location === "/registry-assessment" 
                ? "bg-[hsl(213,94%,42%)] hover:bg-[hsl(218,100%,34%)]" 
                : "border-[hsl(213,94%,42%)] text-[hsl(213,94%,42%)] hover:bg-[hsl(213,94%,42%)] hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            風險登記表自評 | Registry Assessment
          </Button>
        </Link>
        
        <Link href="/risk-registry">
          <Button 
            variant={location === "/risk-registry" ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              location === "/risk-registry" 
                ? "bg-[hsl(213,94%,42%)] hover:bg-[hsl(218,100%,34%)]" 
                : "border-[hsl(213,94%,42%)] text-[hsl(213,94%,42%)] hover:bg-[hsl(213,94%,42%)] hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            風險登陸表 | Risk Registry
          </Button>
        </Link>
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          {getDescription()}
        </p>
      </div>
    </Card>
  );
};

export default Navigation;