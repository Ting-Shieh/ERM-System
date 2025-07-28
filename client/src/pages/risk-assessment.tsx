import { useState } from "react";
import { ParticipantForm } from "@/components/participant-form";
import Navigation from "@/components/ui/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Info, CheckCircle, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function RiskAssessmentPage() {
  const [participantData, setParticipantData] = useState<any>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="gradient-bg text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            2025 Year-end Risk Self-assessment
          </h1>
          <p className="text-xl text-center text-blue-100 font-medium">
            2025 年度企業風險自評問卷
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
                <Info className="text-[hsl(213,94%,42%)] text-xl mt-1 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(218,100%,34%)] mb-3">Introduction</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    This questionnaire is designed based on the systematic approach of assessing risks in accordance with COSO ERM, and we sincerely invite you to participate in the 2025 risk self-assessment process. Your observations and insights will contribute significantly to our overall risk assessment. To ensure sufficient time for completion, we kindly request that you complete the questionnaire by <strong className="text-[hsl(213,94%,42%)]">Sep. 15th 2025</strong>. Thank you very much!
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    本問卷是根據 COSO ERM 定義的企業評估風險的系統化方法而定義，誠摯邀請您參與 2025 年度風險自評流程。您的觀察和理解將對我們的整體風險評估做出重大貢獻，為確保有足夠的時間完成，我們懇請您在 <strong className="text-[hsl(213,94%,42%)]">2025年9月15日</strong> 之前完成問卷的填寫。非常感謝！
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participant Information Form */}
        <ParticipantForm onDataChange={setParticipantData} />

        {/* Acknowledgement Section */}
        <Card className="form-shadow mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <CheckCircle className="text-[hsl(213,94%,42%)] text-2xl mr-3" />
              <h2 className="text-2xl font-semibold text-[hsl(218,100%,34%)]">Acknowledgement / 聲明</h2>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4 leading-relaxed">
                I understand that this risk self-assessment is based on my observations and understanding under the existing internal control mechanisms and defined approval authority, encompassing the department/unit/project/function that I manage and the scope of collaboration. The assessment method is derived from evaluating the comparative results, taking into account the operational management status from <strong>January 1, 2025, until now</strong>, to infer the potential impact of various risk categories and items on company operations in the foreseeable future.
              </p>
              <p className="text-gray-700 leading-relaxed">
                我瞭解本次風險自評是基於我所管理的部門/單位/專案/職能及協作範圍，綜合評估目前內部控制機制及核決權限規範之下的觀察與瞭解所提出的評比結果。評估方式是依據 <strong>2025年1月1日</strong>迄今營運管理狀況推論可預見未來各風險類別及項目對於公司營運可能帶來的風險層級影響。
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="acknowledgement" 
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
                className="mt-1"
              />
              <Label htmlFor="acknowledgement" className="text-sm font-semibold text-[hsl(0,0%,26%)]">
                <strong>Yes, I understand and agree. / 是，我瞭解並同意。</strong>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Rating Definitions */}
        <Card className="form-shadow mb-8">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <div className="text-[hsl(213,94%,42%)] text-2xl mr-3">📊</div>
              <h2 className="text-2xl font-semibold text-[hsl(218,100%,34%)]">Rating Definitions / 評級定義</h2>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-gray-700 mb-4 leading-relaxed">
                Please assess each risk item based on its <strong className="text-[hsl(213,94%,42%)]">Impact (影響程度)</strong> and <strong className="text-[hsl(213,94%,42%)]">Likelihood (發生可能性)</strong>. The combination of these two factors will determine the final risk level on the heat map.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                請根據每個風險項目的<strong className="text-[hsl(213,94%,42%)]">影響程度</strong>與<strong className="text-[hsl(213,94%,42%)]">發生可能性</strong>進行評估，這兩項數據將決定該風險在熱區圖上的最終等級。
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
                <h4 className="font-semibold text-[hsl(218,100%,34%)] mb-3 flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  Impact (影響程度)
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The potential effect on operational objectives if the risk occurs. (1: Negligible ~ 5: Catastrophic)<br />
                  風險發生後對營運目標的潛在影響。(1: 可忽略 ~ 5: 災難性)
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-[hsl(218,100%,34%)] mb-3 flex items-center">
                  <span className="text-yellow-600 mr-2">🕐</span>
                  Likelihood (發生可能性)
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The probability of the risk occurring in the foreseeable future. (1: Rare ~ 5: Almost Certain)<br />
                  可預見的未來中，此風險發生的機率。(1: 極低 ~ 5: 幾乎確定)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment Section */}
        <Card className="form-shadow">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-[hsl(218,100%,34%)] mb-4">
                風險評估方式 | Risk Assessment Method
              </h2>
              <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
                請使用風險登陸表進行風險自評。系統將顯示2024年歷史評估數據作為參考，您需要填寫2025年的風險評估。
              </p>
              <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
                Please use the Risk Registry for risk self-assessment. The system will display 2024 historical assessment data for reference, and you need to complete the 2025 risk assessment.
              </p>
              
              {participantData && acknowledged ? (
                <Link href="/registry-assessment">
                  <Button className="bg-[hsl(213,94%,42%)] hover:bg-[hsl(218,100%,34%)] text-white px-8 py-3 text-lg">
                    開始風險自評 Start Risk Assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800 font-medium">
                    請先完成上方的參與者資訊填寫及聲明確認，才能開始風險評估。
                  </p>
                  <p className="text-yellow-700 text-sm mt-2">
                    Please complete the participant information and acknowledgement above before starting the risk assessment.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
