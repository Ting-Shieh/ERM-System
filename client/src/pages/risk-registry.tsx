import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/ui/navigation";
import { FileSpreadsheet, Building2, AlertTriangle, TrendingUp } from "lucide-react";
import type { RiskRegistry } from "@shared/schema";

// Risk level color mapping
const getRiskLevelColor = (level: number | null) => {
  if (!level) return "bg-gray-100 text-gray-800";
  if (level <= 4) return "bg-green-100 text-green-800";
  if (level <= 9) return "bg-yellow-100 text-yellow-800";
  if (level <= 16) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

const getRiskLevelText = (level: number | null) => {
  if (!level) return "未評估";
  if (level <= 4) return "低風險";
  if (level <= 9) return "中風險";
  if (level <= 16) return "高風險";
  return "極高風險";
};

const RiskRegistryPage = () => {
  const { data: registries = [], isLoading } = useQuery<RiskRegistry[]>({
    queryKey: ['/api/risk-registry'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(213,94%,42%)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Risk Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Navigation />
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileSpreadsheet className="text-[hsl(213,94%,42%)] text-4xl mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-[hsl(218,100%,34%)]">風險登陸表</h1>
              <h2 className="text-2xl font-semibold text-[hsl(213,94%,42%)] mt-2">Risk Registry</h2>
            </div>
          </div>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            企業風險管理之風險回應控制措施及監督規劃結果
          </p>
          <p className="text-base text-gray-600 mt-2">
            Enterprise Risk Management: Risk Response Control Measures and Monitoring Planning Results
          </p>
        </div>

        {/* Introduction Card */}
        <Card className="mb-8 border-[hsl(213,94%,42%)] border-2">
          <CardHeader className="bg-gradient-to-r from-[hsl(213,94%,42%)] to-[hsl(218,100%,34%)] text-white">
            <div className="flex items-center">
              <Building2 className="text-white text-xl mt-1 mr-3" />
              <div>
                <CardTitle className="text-xl">2025年度企業風險自評問卷基礎資料</CardTitle>
                <CardDescription className="text-blue-100 mt-2">
                  Based on 2024 Risk Assessment Results for 2025 Annual Enterprise Risk Self-Assessment
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="text-[hsl(213,94%,42%)] text-lg mr-2" />
                <div>
                  <p className="font-semibold text-gray-800">風險項目數量</p>
                  <p className="text-2xl font-bold text-[hsl(213,94%,42%)]">{registries.length}</p>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="text-[hsl(213,94%,42%)] text-lg mr-2" />
                <div>
                  <p className="font-semibold text-gray-800">評估完成率</p>
                  <p className="text-2xl font-bold text-[hsl(213,94%,42%)]">
                    {registries.length > 0 ? Math.round((registries.filter(r => r.responsibleRiskLevel).length / registries.length) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Building2 className="text-[hsl(213,94%,42%)] text-lg mr-2" />
                <div>
                  <p className="font-semibold text-gray-800">涉及部門</p>
                  <p className="text-2xl font-bold text-[hsl(213,94%,42%)]">
                    {new Set(registries.map(r => r.responsibleDepartment)).size}
                  </p>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-gray-700 leading-relaxed">
              本風險登陸表整合了2024年度風險評估結果，為各業務單位提供詳細的風險情境、現有對策及監督指標，
              協助進行2025年度企業風險自評問卷填寫。請各單位依據此表所列風險項目，結合當前營運狀況進行評估。
            </p>
            <p className="text-gray-600 mt-2 text-sm">
              This risk registry integrates 2024 risk assessment results, providing detailed risk scenarios, 
              existing measures, and monitoring indicators to assist business units in completing the 2025 annual 
              enterprise risk self-assessment questionnaire.
            </p>
          </CardContent>
        </Card>

        {/* Risk Registry Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-[hsl(218,100%,34%)]">
              風險登陸表詳細資料 | Risk Registry Details
            </CardTitle>
            <CardDescription>
              Complete risk registry with assessment details and control measures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[800px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">策略目標<br/>Strategic Objective</TableHead>
                    <TableHead className="w-[100px]">主責部門<br/>Department</TableHead>
                    <TableHead className="w-[100px]">風險擁有者<br/>Risk Owner</TableHead>
                    <TableHead className="w-[80px]">風險類別<br/>Category</TableHead>
                    <TableHead className="w-[200px]">風險情境<br/>Risk Scenario</TableHead>
                    <TableHead className="w-[150px]">現有風險對策<br/>Existing Measures</TableHead>
                    <TableHead className="w-[80px]">單位風險等級<br/>Unit Risk Level</TableHead>
                    <TableHead className="w-[80px]">主責風險等級<br/>Responsible Risk Level</TableHead>
                    <TableHead className="w-[100px]">風險回應方式<br/>Response Strategy</TableHead>
                    <TableHead className="w-[150px]">新增風險對策<br/>New Measures</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registries.map((registry) => (
                    <TableRow key={registry.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="max-w-[120px]">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-2">{registry.strategicObjective}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{registry.subObjective}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-800">{registry.responsibleDepartment}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-gray-800">{registry.riskOwner}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {registry.riskCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="text-sm text-gray-700 line-clamp-3">{registry.riskScenario}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          <p className="text-sm text-gray-700 line-clamp-3">{registry.existingMeasures}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {registry.unitRiskLevel ? (
                          <Badge className={`${getRiskLevelColor(registry.unitRiskLevel)} text-xs`}>
                            {registry.unitRiskLevel} - {getRiskLevelText(registry.unitRiskLevel)}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">未評估</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {registry.responsibleRiskLevel ? (
                          <Badge className={`${getRiskLevelColor(registry.responsibleRiskLevel)} text-xs`}>
                            {registry.responsibleRiskLevel} - {getRiskLevelText(registry.responsibleRiskLevel)}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">未評估</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {registry.responseStrategy ? (
                          <Badge variant="outline" className="text-xs">
                            {registry.responseStrategy}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          {registry.newRiskMeasures ? (
                            <p className="text-sm text-gray-700 line-clamp-3">{registry.newRiskMeasures}</p>
                          ) : (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {registries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-gray-500">
                          <FileSpreadsheet className="mx-auto mb-2 text-4xl" />
                          <p>No risk registry data available</p>
                          <p className="text-sm">暫無風險登陸表資料</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Footer Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            資料更新時間 | Last Updated: {new Date().toLocaleString('zh-TW')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Enterprise Risk Management System | 企業風險管理系統
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskRegistryPage;