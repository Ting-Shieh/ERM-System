import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/ui/navigation";
import RegistryBasedAssessment from "@/components/registry-based-assessment";
import { ClipboardCheck, FileSpreadsheet, TrendingUp } from "lucide-react";

export default function RegistryAssessmentPage() {
  const [activeTab, setActiveTab] = useState("assessment");

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
                    <div className="text-center py-12">
                      <FileSpreadsheet className="mx-auto mb-4 text-6xl text-gray-300" />
                      <p className="text-gray-500 mb-2">Assessment history will be displayed here</p>
                      <p className="text-sm text-gray-400">評估歷史記錄將顯示在此處</p>
                    </div>
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
    </div>
  );
}