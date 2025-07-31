import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, TrendingUp, Target, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Navigation2025 from "@/components/ui/navigation-2025";

interface RiskRegistry2025 {
  id: number;
  strategicObjective: string;
  subObjective: string;
  responsibleDepartment: string;
  riskOwner: string;
  riskCategory: string;
  riskScenario: string;
  responsibleRiskLevel: number;
  operationalTarget?: string;
  aiOptimizationSuggestion?: string;
  industryReference?: string;
}

const assessmentFormSchema = z.object({
  assessorEmail: z.string().email("請輸入有效的 Email"),
  assessorName: z.string().min(1, "請輸入評估者姓名"),
  assessorDepartment: z.string().min(1, "請輸入評估者部門"),
  // 各單位評估
  unitPossibility: z.number().min(1).max(5),
  unitImpact: z.number().min(1).max(5),
  unitRiskLevel: z.number().min(1).max(25),
  // 主責單位評估
  responsiblePossibility: z.number().min(1).max(5),
  responsibleImpact: z.number().min(1).max(5),
  responsibleRiskLevel: z.number().min(1).max(25),
  // 其他欄位
  riskMeasures: z.string().optional(),
  notes: z.string().optional(),
  suggestions: z.string().optional(),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

const RiskAssessment2025 = () => {
  const [selectedRisk, setSelectedRisk] = useState<RiskRegistry2025 | null>(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<string>("全部");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 取得 2025 年風險註冊表資料
  const { data: riskRegistryData, isLoading, error } = useQuery<RiskRegistry2025[]>({
    queryKey: ['/api/risk-registry-2025'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/risk-registry-2025');
      return response.json();
    },
  });

  // 提交評估的 mutation
  const submitAssessment = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      const assessmentData = {
        ...data,
        riskId: selectedRisk?.id,
        strategicObjective: selectedRisk?.strategicObjective,
        subObjective: selectedRisk?.subObjective,
        riskCategory: selectedRisk?.riskCategory,
        existingMeasures: selectedRisk?.existingMeasures,
        // 確保風險等級是數字
        unitRiskLevel: Number(data.unitRiskLevel),
        responsibleRiskLevel: Number(data.responsibleRiskLevel),
        year: 2025,
      };
      const response = await apiRequest('POST', '/api/risk-assessments-2025', assessmentData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "評估提交成功",
        description: "您的風險評估已成功提交",
      });
      setShowAssessmentForm(false);
      setSelectedRisk(null);
      queryClient.invalidateQueries({ queryKey: ['/api/risk-assessments-2025'] });
    },
    onError: (error) => {
      toast({
        title: "提交失敗",
        description: "評估提交時發生錯誤，請稍後再試",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      assessorEmail: "",
      assessorName: "",
      assessorDepartment: "",
      // 各單位評估
      unitPossibility: 3,
      unitImpact: 3,
      unitRiskLevel: 3 * 3, // 自動計算初始值
      // 主責單位評估
      responsiblePossibility: 3,
      responsibleImpact: 3,
      responsibleRiskLevel: 3 * 3, // 自動計算初始值
      // 其他欄位
      riskMeasures: "",
      notes: "",
      suggestions: "",
    },
  });

  const handleRiskSelect = (risk: RiskRegistry2025) => {
    setSelectedRisk(risk);
    setShowAssessmentForm(true);
  };

  const handleSubmit = (data: AssessmentFormData) => {
    submitAssessment.mutate(data);
  };

  // 確保表單初始化時正確計算風險等級
  useEffect(() => {
    const unitPossibility = form.getValues("unitPossibility");
    const unitImpact = form.getValues("unitImpact");
    const responsiblePossibility = form.getValues("responsiblePossibility");
    const responsibleImpact = form.getValues("responsibleImpact");
    
    form.setValue("unitRiskLevel", unitPossibility * unitImpact);
    form.setValue("responsibleRiskLevel", responsiblePossibility * responsibleImpact);
  }, [form]);

  const getRiskLevelColor = (level: number) => {
    if (level <= 4) return "bg-green-100 text-green-800 border-green-200";
    if (level <= 8) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (level <= 12) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getRiskLevelText = (level: number) => {
    if (level <= 4) return "低風險";
    if (level <= 8) return "中風險";
    if (level <= 12) return "高風險";
    return "極高風險";
  };

  // 取得所有策略目標及其項目數量
  const getStrategicObjectives = () => {
    if (!riskRegistryData || !Array.isArray(riskRegistryData)) {
      // 如果資料還沒載入，返回預設的 9 個策略目標（簡化名稱）
      return [
        { name: "營收目標450億", count: 0 },
        { name: "專注產品項目", count: 0 },
        { name: "強化品牌價值", count: 0 },
        { name: "布局文化藝術", count: 0 },
        { name: "切入AI區塊鏈", count: 0 },
        { name: "系統韌性安全", count: 0 },
        { name: "降低庫存水位", count: 0 },
        { name: "永續發展ESG", count: 0 },
        { name: "利潤提升", count: 0 }
      ];
    }
    
    const objectives = riskRegistryData.reduce((acc, risk) => {
      const objective = risk.strategicObjective;
      if (!acc[objective]) {
        acc[objective] = 0;
      }
      acc[objective]++;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(objectives).map(([objective, count]) => ({
      name: objective,
      count
    }));
  };

  // 根據選取的策略目標篩選風險項目
  const filteredRiskData = riskRegistryData && Array.isArray(riskRegistryData) 
    ? selectedObjective === "全部" 
      ? riskRegistryData 
      : riskRegistryData.filter(risk => risk.strategicObjective === selectedObjective)
    : [];

  // 移除載入狀態的獨立頁面，讓標籤一開始就顯示

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="gradient-bg text-white py-8">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
              2025 Year-end Risk Assessment
            </h1>
            <p className="text-xl text-center text-blue-100 font-medium">
              基於 ERM_Gimini 90 工作表的 2025 年風險評估
            </p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Navigation />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-medium mb-2">載入資料時發生錯誤</p>
                <p className="text-gray-600 text-sm">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="gradient-bg text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            2025 Year-end Risk Assessment
          </h1>
          <p className="text-xl text-center text-blue-100 font-medium">
            基於 ERM_Gimini 90 工作表的 2025 年風險評估
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <Navigation2025 />

        {/* Introduction Card */}
        <Card className="form-shadow mb-8">
          <CardContent className="p-8">
            <div className="border-l-4 border-[hsl(213,94%,42%)] bg-blue-50 p-6 rounded-r-lg">
              <div className="flex items-start">
                <Info className="text-[hsl(213,94%,42%)] text-xl mt-1 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(218,100%,34%)] mb-3">
                    2025 年風險評估系統 | 2025 Risk Assessment System
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    This system provides comprehensive risk assessment capabilities based on the ERM_Gimini 90 worksheet data. 
                    You can select from 97 risk items across 9 strategic objectives and provide detailed assessments with AI optimization suggestions and industry reference cases.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    本系統基於 ERM_Gimini 90 工作表資料提供全面的風險評估功能。您可以從 9 個策略目標的 97 個風險項目中選擇，並提供詳細評估。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="form-shadow mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(213,94%,42%)]">
                    {isLoading ? "載入中..." : (riskRegistryData?.length || 97)}
                  </div>
                  <div className="text-sm text-gray-600">總風險項目</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(213,94%,42%)]">9</div>
                  <div className="text-sm text-gray-600">策略目標</div>
                </div>
              </div>
              <Badge variant="outline" className="text-sm bg-blue-50 border-blue-200 text-blue-800">
                2025 年度資料
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Rating Definitions Card */}
        <Card className="form-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(218,100%,34%)]">
              <div className="text-[hsl(213,94%,42%)] text-2xl">📊</div>
              評級定義 | Rating Definitions
            </CardTitle>
            <CardDescription className="text-gray-600">
              請根據以下定義評估每個風險項目的可能性與影響程度
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Possibility Rating */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-[hsl(218,100%,34%)] mb-4 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                發生可能性 | Likelihood
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-800 border-red-200">5</Badge>
                    <span className="font-medium text-gray-700">幾乎確定 | Almost Certain</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">4</Badge>
                    <span className="font-medium text-gray-700">很可能 | Likely</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">3</Badge>
                    <span className="font-medium text-gray-700">可能 | Possible</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">2</Badge>
                    <span className="font-medium text-gray-700">不太可能 | Unlikely</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800 border-green-200">1</Badge>
                    <span className="font-medium text-gray-700">極不可能 | Rare</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Rating */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h4 className="font-semibold text-[hsl(218,100%,34%)] mb-4 flex items-center gap-2">
                <span className="text-lg">💥</span>
                影響程度 | Impact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-red-100 text-red-800 border-red-200">5</Badge>
                    <span className="font-medium text-gray-700">極嚴重 | Critical</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-100 text-orange-800 border-orange-200">4</Badge>
                    <span className="font-medium text-gray-700">嚴重 | Major</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">3</Badge>
                    <span className="font-medium text-gray-700">中等 | Moderate</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">2</Badge>
                    <span className="font-medium text-gray-700">輕微 | Minor</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800 border-green-200">1</Badge>
                    <span className="font-medium text-gray-700">極輕微 | Negligible</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level Matrix */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-[hsl(218,100%,34%)] mb-4 flex items-center gap-2">
                <span className="text-lg">🎨</span>
                風險等級矩陣 | Risk Level Matrix
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">可能性</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">1</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">2</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">3</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">4</th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold">5</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold bg-gray-50">5</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-green-100">5</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-yellow-100">10</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-orange-100">15</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-red-100">20</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-red-200 font-bold">25</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold bg-gray-50">4</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-green-100">4</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-yellow-100">8</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-orange-100">12</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-red-100">16</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-red-200">20</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold bg-gray-50">3</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-green-100">3</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-yellow-100">6</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-orange-100">9</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-orange-100">12</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-red-100">15</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold bg-gray-50">2</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-green-100">2</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-green-100">4</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-yellow-100">6</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-yellow-100">8</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-orange-100">10</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 text-center font-semibold bg-gray-50">1</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-green-100">1</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-green-100">2</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-green-100">3</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-yellow-100">4</td>
                      <td className="border border-gray-300 px-3 py-2 text-center bg-yellow-100">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-700">低風險 (1-4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span className="text-gray-700">中風險 (5-8)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
                  <span className="text-gray-700">高風險 (9-12)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-gray-700">極高風險 (15-25)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Objectives Filter */}
        <Card className="form-shadow mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(218,100%,34%)]">
              <TrendingUp className="w-5 h-5" />
              策略目標篩選
            </CardTitle>
            <CardDescription className="text-gray-600">
              點選下方標籤快速篩選不同策略目標的風險項目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedObjective === "全部" ? "default" : "outline"}
                size="default"
                onClick={() => setSelectedObjective("全部")}
                className={`px-4 py-2 transition-all duration-200 ${
                  selectedObjective === "全部" 
                    ? "bg-[hsl(213,94%,42%)] hover:bg-[hsl(213,94%,38%)] text-white shadow-lg scale-105" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-102"
                }`}
              >
                全部
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-sm font-bold px-2 py-1 ${
                    selectedObjective === "全部" 
                      ? "bg-white text-[hsl(213,94%,42%)] border-2 border-white shadow-sm" 
                      : "bg-gray-100 text-gray-700 border border-gray-300"
                  }`}
                >
                  {isLoading ? "載入中" : (riskRegistryData?.length || 97)}
                </Badge>
              </Button>
              {getStrategicObjectives().map((objective) => (
                <Button
                  key={objective.name}
                  variant={selectedObjective === objective.name ? "default" : "outline"}
                  size="default"
                  onClick={() => setSelectedObjective(objective.name)}
                  className={`px-4 py-2 transition-all duration-200 ${
                    selectedObjective === objective.name 
                      ? "bg-[hsl(213,94%,42%)] hover:bg-[hsl(213,94%,38%)] text-white shadow-lg scale-105" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-102"
                  }`}
                >
                  <span className="text-sm" title={objective.name}>
                    {objective.name}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className={`ml-2 text-sm font-bold px-2 py-1 min-w-[24px] ${
                      selectedObjective === objective.name 
                        ? "bg-white text-[hsl(213,94%,42%)] border-2 border-white shadow-sm" 
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {isLoading ? "載入中" : objective.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Selection */}
        <Card className="form-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(218,100%,34%)]">
              <Target className="w-5 h-5" />
              選擇風險項目進行評估
              {selectedObjective !== "全部" && (
                <Badge variant="outline" className="text-sm bg-blue-50 border-blue-200 text-blue-800">
                  {selectedObjective} ({filteredRiskData.length} 項)
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-gray-600">
              從以下 2025 年風險項目中選擇一個進行評估
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {isLoading ? (
                // 載入中的骨架屏
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="h-16 bg-gray-200 rounded w-full"></div>
                        </div>
                        <div className="lg:w-80 space-y-3">
                          <div className="h-24 bg-gray-200 rounded"></div>
                          <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredRiskData && filteredRiskData.length > 0 ? filteredRiskData.map((risk) => (
                <Card 
                  key={risk.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-[hsl(213,94%,42%)] group"
                  onClick={() => handleRiskSelect(risk)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* 左側：策略資訊 */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-[hsl(213,94%,42%)] rounded-full"></div>
                          <h4 className="font-semibold text-[hsl(218,100%,34%)] group-hover:text-[hsl(213,94%,42%)] transition-colors text-lg">
                            {risk.strategicObjective}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-700 mb-2 font-medium bg-gray-50 px-2 py-1 rounded inline-block">{risk.subObjective}</p>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">{risk.riskScenario}</p>
                      </div>
                      
                      {/* 右側：詳細資訊 */}
                      <div className="lg:w-80 space-y-3">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <h5 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">風險資訊</h5>
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-gray-600">風險類別:</span>
                              <span className="text-xs text-gray-800 text-right max-w-[60%]">{risk.riskCategory}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-gray-600">主責部門:</span>
                              <span className="text-xs text-gray-800 text-right max-w-[60%]">{risk.responsibleDepartment}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-gray-600">風險擁有者:</span>
                              <span className="text-xs text-gray-800 text-right max-w-[60%]">{risk.riskOwner}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* 操作目標 */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <h5 className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">操作目標</h5>
                          <div className="flex justify-between items-start">
                            <span className="text-xs text-blue-800 text-right">{risk.operationalTarget || '未設定'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full text-center py-12">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                    <Target className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium mb-2">
                      {selectedObjective === "全部" 
                        ? (riskRegistryData?.length === 0 ? '沒有找到風險資料' : '載入中...')
                        : `在「${selectedObjective}」中沒有找到風險項目`
                      }
                    </p>
                    {selectedObjective !== "全部" && (
                      <p className="text-gray-500 text-sm">
                        請嘗試選擇其他策略目標或查看全部項目
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assessment Form Dialog */}
        <Dialog open={showAssessmentForm} onOpenChange={setShowAssessmentForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[hsl(218,100%,34%)]">2025 年風險評估表單</DialogTitle>
              <DialogDescription className="text-gray-600">
                評估選定的風險項目：{selectedRisk?.strategicObjective} - {selectedRisk?.subObjective}
              </DialogDescription>
            </DialogHeader>

            {selectedRisk && (
              <div className="space-y-6">
                {/* Risk Information */}
                <Card className="border-l-4 border-[hsl(213,94%,42%)] bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-[hsl(218,100%,34%)]">📋 風險項目資訊</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="font-medium text-gray-700">風險情境:</span>
                      <p className="text-gray-600 text-sm mt-1 bg-white p-3 rounded border">{selectedRisk.riskScenario}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">負責部門:</span>
                        <p className="text-gray-600">{selectedRisk.responsibleDepartment}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">風險類別:</span>
                        <p className="text-gray-600">{selectedRisk.riskCategory}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>



                {/* Assessment Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="assessorEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>評估者 Email</FormLabel>
                            <FormControl>
                              <Input placeholder="your.email@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="assessorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>評估者姓名</FormLabel>
                            <FormControl>
                              <Input placeholder="您的姓名" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="assessorDepartment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>評估者部門</FormLabel>
                            <FormControl>
                              <Input placeholder="您的部門" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* 各單位評估 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-[hsl(218,100%,34%)] text-sm border-b border-gray-200 pb-2">
                        📊 各單位評估 (Unit Assessment)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="unitPossibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>可能性－各單位 (1-5)</FormLabel>
                              <Select onValueChange={(value) => {
                                const newValue = parseInt(value);
                                field.onChange(newValue);
                                // 自動計算風險等級
                                const impact = form.getValues("unitImpact");
                                form.setValue("unitRiskLevel", newValue * impact);
                              }} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="選擇可能性" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - 極不可能</SelectItem>
                                  <SelectItem value="2">2 - 不太可能</SelectItem>
                                  <SelectItem value="3">3 - 可能</SelectItem>
                                  <SelectItem value="4">4 - 很可能</SelectItem>
                                  <SelectItem value="5">5 - 幾乎確定</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="unitImpact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>影響－各單位 (1-5)</FormLabel>
                              <Select onValueChange={(value) => {
                                const newValue = parseInt(value);
                                field.onChange(newValue);
                                // 自動計算風險等級
                                const possibility = form.getValues("unitPossibility");
                                form.setValue("unitRiskLevel", possibility * newValue);
                              }} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="選擇影響程度" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - 極低</SelectItem>
                                  <SelectItem value="2">2 - 低</SelectItem>
                                  <SelectItem value="3">3 - 中等</SelectItem>
                                  <SelectItem value="4">4 - 高</SelectItem>
                                  <SelectItem value="5">5 - 極高</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="unitRiskLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>風險等級－各單位</FormLabel>
                              <FormControl>
                                <Input 
                                  readOnly 
                                  className="bg-gray-50"
                                  value={`${field.value || 0} (${getRiskLevelText(field.value || 0)})`}
                                />
                              </FormControl>
                              <FormDescription>
                                自動計算：可能性 × 影響
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* 主責單位評估 */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-[hsl(218,100%,34%)] text-sm border-b border-gray-200 pb-2">
                        🎯 主責單位評估 (Responsible Unit Assessment)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="responsiblePossibility"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>可能性－主責單位 (1-5)</FormLabel>
                              <Select onValueChange={(value) => {
                                const newValue = parseInt(value);
                                field.onChange(newValue);
                                // 自動計算風險等級
                                const impact = form.getValues("responsibleImpact");
                                form.setValue("responsibleRiskLevel", newValue * impact);
                              }} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="選擇可能性" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - 極不可能</SelectItem>
                                  <SelectItem value="2">2 - 不太可能</SelectItem>
                                  <SelectItem value="3">3 - 可能</SelectItem>
                                  <SelectItem value="4">4 - 很可能</SelectItem>
                                  <SelectItem value="5">5 - 幾乎確定</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="responsibleImpact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>影響－主責單位 (1-5)</FormLabel>
                              <Select onValueChange={(value) => {
                                const newValue = parseInt(value);
                                field.onChange(newValue);
                                // 自動計算風險等級
                                const possibility = form.getValues("responsiblePossibility");
                                form.setValue("responsibleRiskLevel", possibility * newValue);
                              }} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="選擇影響程度" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">1 - 極低</SelectItem>
                                  <SelectItem value="2">2 - 低</SelectItem>
                                  <SelectItem value="3">3 - 中等</SelectItem>
                                  <SelectItem value="4">4 - 高</SelectItem>
                                  <SelectItem value="5">5 - 極高</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="responsibleRiskLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>風險等級－主責單位</FormLabel>
                              <FormControl>
                                <Input 
                                  readOnly 
                                  className="bg-gray-50"
                                  value={`${field.value || 0} (${getRiskLevelText(field.value || 0)})`}
                                />
                              </FormControl>
                              <FormDescription>
                                自動計算：可能性 × 影響
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                                        <FormField
                      control={form.control}
                      name="riskMeasures"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>風險對策規劃</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={`請規劃完整的風險對策：

1. 現有對策檢討：
   • 實施狀況如何？效果評估？
   • 存在哪些問題？改進空間？

2. 新增對策提案：
   • 要解決什麼問題？預期效果？
   • 實施計劃和時程安排？
   • 所需資源和風險考量？

3. 整體對策整合：
   • 如何協調現有和新增對策？
   • 優先級和實施順序？`}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            請基於風險情境，制定完整的對策規劃，包含現有對策檢討和新增對策提案
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>評估備註</FormLabel>
                          <FormControl>
                            <Textarea placeholder="請輸入您的評估備註..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="suggestions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>改善建議與行動計劃</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={`請提出具體的改善建議和行動計劃：

1. 短期改善 (3個月內)：
   • 立即可以執行的改善措施
   • 快速見效的優化方案

2. 中期改善 (6-12個月)：
   • 需要規劃和資源投入的改善
   • 系統性的優化措施

3. 長期改善 (1年以上)：
   • 戰略性的改善方向
   • 需要持續投入的優化計劃

4. 成功指標：
   • 如何衡量改善效果？
   • 具體的量化指標？`}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            請基於風險評估結果，提出分階段、可執行的改善建議和行動計劃
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAssessmentForm(false)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        取消
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={submitAssessment.isPending}
                        className="bg-[hsl(213,94%,42%)] hover:bg-[hsl(213,94%,38%)] text-white"
                      >
                        {submitAssessment.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            提交中...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            提交評估
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RiskAssessment2025; 