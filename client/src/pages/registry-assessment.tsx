import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import RegistryBasedAssessment from "@/components/registry-based-assessment";
import { ClipboardCheck, FileSpreadsheet, TrendingUp, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RegistryAssessment, RiskRegistry } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RegistryAssessmentPage() {
  const [activeTab, setActiveTab] = useState("assessment");
  const [selectedAssessment, setSelectedAssessment] = useState<RegistryAssessment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 取得所有評估記錄
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<RegistryAssessment[]>({
    queryKey: ['/api/registry-assessments'],
  });

  // 取得風險登陸表資料（用於顯示風險項目名稱）
  const { data: registries = [] } = useQuery<RiskRegistry[]>({
    queryKey: ['/api/risk-registry'],
  });

  // 取得風險項目名稱的輔助函數
  const getRiskName = (riskId: number) => {
    const risk = registries.find(r => r.id === riskId);
    return risk ? risk.riskScenario : `Risk ID: ${riskId}`;
  };

  // 風險等級顏色函數
  const getRiskLevelColor = (level: number) => {
    if (level <= 4) return "bg-green-100 text-green-800";
    if (level <= 9) return "bg-yellow-100 text-yellow-800";
    if (level <= 16) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  // 開啟詳細檢視 Modal
  const openDetailModal = (assessment: RegistryAssessment) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  // 關閉 Modal
  const closeDetailModal = () => {
    setIsModalOpen(false);
    setSelectedAssessment(null);
  };

  // 風險變化分析函數
  const getChangeColor = (change: number) => {
    if (change > 0) return "text-red-600";
    if (change < 0) return "text-green-600";
    return "text-gray-600";
  };

  const getChangeText = (change: number) => {
    if (change > 0) return `+${change} (上升)`;
    if (change < 0) return `${change} (下降)`;
    return "0 (無變化)";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="gradient-bg text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Registry-based Risk Assessment
          </h1>
          <p className="text-xl text-center text-blue-100 font-medium">
            基於風險登陸表的風險自評系統
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation */}
        <Navigation />

        {/* Introduction Card */}
        <Card className="form-shadow mb-8">
          <CardContent className="p-8">
            <div className="border-l-4 border-[hsl(213,94%,42%)] bg-blue-50 p-6 rounded-r-lg">
              <div className="flex items-start">
                <TrendingUp className="text-[hsl(213,94%,42%)] text-xl mt-1 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(218,100%,34%)] mb-3">
                    基於風險登陸表的自評系統 | Registry-based Assessment System
                  </h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    This system allows you to conduct risk assessments based on the existing risk registry data from 2024. 
                    Select risks from the comprehensive registry and provide your current assessment based on your department's 
                    operational situation. Your evaluation will contribute to the 2025 annual enterprise risk management process.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    本系統讓您可以基於2024年風險登陸表資料進行風險自評。從完整的風險登記表中選擇風險項目，
                    根據您部門當前營運狀況提供評估。您的評估將有助於2025年度企業風險管理流程。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Assessment Interface */}
        <Card className="form-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[hsl(218,100%,34%)]">
              <ClipboardCheck className="w-6 h-6" />
              風險自評作業 | Risk Self-Assessment
            </CardTitle>
            <CardDescription>
              Select and assess risks from the enterprise risk registry
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="assessment" className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" />
                  風險評估 Assessment
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  評估記錄 History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="assessment" className="mt-6">
                <RegistryBasedAssessment />
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>評估歷史記錄 | Assessment History</CardTitle>
                    <CardDescription>
                      View previously submitted risk assessments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assessmentsLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(213,94%,42%)] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading assessment history...</p>
                      </div>
                    ) : assessments.length === 0 ? (
                      <div className="text-center py-12">
                        <FileSpreadsheet className="mx-auto mb-4 text-6xl text-gray-300" />
                        <p className="text-gray-500 mb-2">No assessment records found</p>
                        <p className="text-sm text-gray-400">尚未有評估記錄</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>評估者</TableHead>
                              <TableHead>風險項目</TableHead>
                              <TableHead>影響程度</TableHead>
                              <TableHead>可能性</TableHead>
                              <TableHead>風險等級</TableHead>
                              <TableHead>評估時間</TableHead>
                              <TableHead>操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assessments.map((assessment) => (
                              <TableRow key={assessment.id}>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{assessment.assessorName}</div>
                                    <div className="text-sm text-gray-500">{assessment.assessorDepartment}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-xs truncate" title={getRiskName(assessment.riskRegistryId)}>
                                    {getRiskName(assessment.riskRegistryId)}
                                  </div>
                                </TableCell>
                                <TableCell>{assessment.currentImpact}</TableCell>
                                <TableCell>{assessment.currentLikelihood}</TableCell>
                                <TableCell>
                                  <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                                    {assessment.riskLevel}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(assessment.createdAt).toLocaleString('zh-TW')}
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openDetailModal(assessment)}
                                    className="border-[hsl(213,94%,42%)] text-[hsl(213,94%,42%)] hover:bg-[hsl(213,94%,42%)] hover:text-white"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    檢視詳情
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileSpreadsheet className="w-6 h-6 text-[hsl(213,94%,42%)]" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">風險登記表整合</h3>
              <p className="text-sm text-gray-600">
                基於2024年完整風險登記表資料，提供結構化的風險評估選項
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">動態風險評估</h3>
              <p className="text-sm text-gray-600">
                即時計算風險等級，支援當前與目標風險水平比較分析
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">完整評估記錄</h3>
              <p className="text-sm text-gray-600">
                儲存評估結果與改善建議，支援企業風險管理決策流程
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              使用說明 | Usage Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3">評估流程 Assessment Process</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
                  <li>從風險登記表中選擇要評估的風險項目</li>
                  <li>填寫評估者基本資訊（姓名、部門、電子郵件）</li>
                  <li>根據當前狀況評估影響程度與發生可能性</li>
                  <li>設定目標風險水平（可選）</li>
                  <li>提供評估備註與改善建議</li>
                  <li>提交評估結果並查看風險等級</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Assessment Criteria</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <Badge className="bg-green-100 text-green-800 mb-1">Impact Level 影響程度</Badge>
                    <p className="text-green-700">1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High</p>
                  </div>
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 mb-1">Likelihood Level 發生可能性</Badge>
                    <p className="text-green-700">1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High</p>
                  </div>
                  <div>
                    <Badge className="bg-purple-100 text-purple-800 mb-1">Risk Level 風險等級</Badge>
                    <p className="text-green-700">Impact × Likelihood = Risk Level (1-25)</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細檢視 Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeDetailModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(218,100%,34%)]">
              <Eye className="w-5 h-5" />
              評估詳細記錄 | Assessment Detail
            </DialogTitle>
            <DialogDescription>
              評估時間：{selectedAssessment ? new Date(selectedAssessment.createdAt).toLocaleString('zh-TW') : ''}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssessment && (
            <div className="space-y-6">
              {/* 評估者資訊 */}
              <Card className="border-[hsl(213,94%,42%)] border-2">
                <CardHeader className="bg-gradient-to-r from-[hsl(213,94%,42%)] to-[hsl(218,100%,34%)] text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    評估者資訊 | Assessor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">姓名</Label>
                      <p className="font-medium text-[hsl(218,100%,34%)]">
                        {selectedAssessment.realAssessorName || selectedAssessment.assessorName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">部門</Label>
                      <p className="font-medium text-[hsl(218,100%,34%)]">
                        {selectedAssessment.realAssessorDepartment || selectedAssessment.assessorDepartment}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">電子郵件</Label>
                      <p className="font-medium text-[hsl(218,100%,34%)]">
                        {selectedAssessment.realAssessorEmail || selectedAssessment.assessorEmail}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 風險項目資訊 */}
              <Card className="border-[hsl(213,94%,42%)] border-2">
                <CardHeader className="bg-gradient-to-r from-[hsl(213,94%,42%)] to-[hsl(218,100%,34%)] text-white">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    風險項目 | Risk Item
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {(() => {
                    const risk = registries.find(r => r.id === selectedAssessment.riskRegistryId);
                    return (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">策略目標</Label>
                          <p className="text-sm text-gray-700 mt-1">{risk?.strategicObjective}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">子策略目標</Label>
                          <p className="text-sm text-gray-700 mt-1">{risk?.subObjective}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">風險情境</Label>
                          <p className="text-sm text-gray-700 mt-1">{risk?.riskScenario}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">風險類別</Label>
                          <Badge variant="outline" className="mt-1 border-[hsl(213,94%,42%)] text-[hsl(213,94%,42%)]">
                            {risk?.riskCategory}
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* 2024年評估結果 */}
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    2024年評估結果 | 2024 Assessment Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {(() => {
                    const risk = registries.find(r => r.id === selectedAssessment.riskRegistryId);
                    return (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <Label className="text-sm font-medium text-gray-700">影響程度</Label>
                          <p className="text-2xl font-bold text-blue-600 mt-1">{risk?.responsibleImpact || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <Label className="text-sm font-medium text-gray-700">可能性</Label>
                          <p className="text-2xl font-bold text-blue-600 mt-1">{risk?.responsiblePossibility || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <Label className="text-sm font-medium text-gray-700">風險等級</Label>
                          <Badge className="text-lg px-3 py-2 bg-orange-100 text-orange-800 mt-1">
                            {risk?.responsibleRiskLevel || 'N/A'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* 2025年評估結果 */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    2025年評估結果 | 2025 Assessment Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <Label className="text-sm font-medium text-gray-700">影響程度</Label>
                      <p className="text-2xl font-bold text-green-600 mt-1">{selectedAssessment.currentImpact}</p>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm font-medium text-gray-700">可能性</Label>
                      <p className="text-2xl font-bold text-green-600 mt-1">{selectedAssessment.currentLikelihood}</p>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm font-medium text-gray-700">風險等級</Label>
                      <Badge className={`text-lg px-3 py-2 mt-1 ${getRiskLevelColor(selectedAssessment.riskLevel)}`}>
                        {selectedAssessment.riskLevel}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* 風險變化分析 */}
                  <div className="border-t border-green-200 pt-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      風險變化分析 | Risk Change Analysis
                    </h4>
                    {(() => {
                      const risk = registries.find(r => r.id === selectedAssessment.riskRegistryId);
                      const impactChange = selectedAssessment.currentImpact - (risk?.responsibleImpact || 0);
                      const likelihoodChange = selectedAssessment.currentLikelihood - (risk?.responsiblePossibility || 0);
                      const riskLevelChange = selectedAssessment.riskLevel - (risk?.responsibleRiskLevel || 0);
                      
                      return (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <Label className="text-sm font-medium text-gray-700">影響程度變化</Label>
                            <p className={`font-medium mt-1 ${getChangeColor(impactChange)}`}>
                              {getChangeText(impactChange)}
                            </p>
                          </div>
                          <div className="text-center">
                            <Label className="text-sm font-medium text-gray-700">可能性變化</Label>
                            <p className={`font-medium mt-1 ${getChangeColor(likelihoodChange)}`}>
                              {getChangeText(likelihoodChange)}
                            </p>
                          </div>
                          <div className="text-center">
                            <Label className="text-sm font-medium text-gray-700">風險等級變化</Label>
                            <p className={`font-medium mt-1 ${getChangeColor(riskLevelChange)}`}>
                              {getChangeText(riskLevelChange)}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* 評估備註 */}
              {selectedAssessment.assessmentNotes && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      評估備註 | Assessment Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedAssessment.assessmentNotes}</p>
                  </CardContent>
                </Card>
              )}

              {/* 改善建議 */}
              {selectedAssessment.mitigationActions && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-purple-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      改善建議 | Mitigation Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedAssessment.mitigationActions}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}