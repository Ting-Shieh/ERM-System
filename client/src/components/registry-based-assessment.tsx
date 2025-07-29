import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle, CheckCircle, Building2, TrendingUp } from "lucide-react";
import type { RiskRegistry } from "@shared/schema";

// Assessment form schema
const assessmentFormSchema = z.object({
  assessorEmail: z.string().email("Invalid email format"),
  assessorName: z.string().min(1, "Name is required"),
  assessorDepartment: z.string().min(1, "Department is required"),
  riskRegistryId: z.number(),
  assessmentNotes: z.string().optional(),
  mitigationActions: z.string().optional(),
  targetImpact: z.number().min(1).max(5),
  targetLikelihood: z.number().min(1).max(5),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

const getRiskLevelColor = (level: number) => {
  if (level <= 4) return "bg-green-100 text-green-800 border-green-200";
  if (level <= 9) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (level <= 16) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
};

const getRiskLevelText = (level: number) => {
  if (level <= 4) return "低風險 Low Risk";
  if (level <= 9) return "中風險 Medium Risk";
  if (level <= 16) return "高風險 High Risk";
  return "極高風險 Critical Risk";
};

const RegistryBasedAssessment = () => {
  const [selectedRisk, setSelectedRisk] = useState<RiskRegistry | null>(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "",
    name: "",
    department: ""
  });
  const [isUserInfoComplete, setIsUserInfoComplete] = useState(true); // Prototype: Skip validation
  const { toast } = useToast();

  const { data: registries = [], isLoading } = useQuery<RiskRegistry[]>({
    queryKey: ['/api/risk-registry'],
  });

  // 取得最新的參與者資訊
  const { data: latestParticipantInfo } = useQuery({
    queryKey: ['/api/risk-assessments'],
    select: (data) => data[data.length - 1] // 取得最新的參與者資訊
  });

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      assessorEmail: userInfo.email,
      assessorName: userInfo.name,
      assessorDepartment: userInfo.department,
      targetImpact: 1,
      targetLikelihood: 1,
    },
  });

  // Update form when user info changes
  const handleUserInfoChange = (field: string, value: string) => {
    const newUserInfo = { ...userInfo, [field]: value };
    setUserInfo(newUserInfo);
    
    // Check if all user info is complete
    const complete = newUserInfo.email && newUserInfo.name && newUserInfo.department;
    setIsUserInfoComplete(!!complete);
    
    // Update form values
    if (field === 'email') form.setValue('assessorEmail', value);
    if (field === 'name') form.setValue('assessorName', value);
    if (field === 'department') form.setValue('assessorDepartment', value);
  };

  const createAssessmentMutation = useMutation({
    mutationFn: (data: AssessmentFormData & { 
      currentImpact: number; 
      currentLikelihood: number; 
      riskLevel: number; 
      targetRiskLevel: number;
      // 新增真實參與者資訊
      realAssessorName: string;
      realAssessorDepartment: string;
      realAssessorEmail: string;
    }) =>
      apiRequest('POST', '/api/registry-assessments', data),
    onSuccess: () => {
      toast({
        title: "Assessment Submitted Successfully",
        description: "Your risk assessment has been recorded.",
      });
      form.reset();
      setShowAssessmentForm(false);
      setSelectedRisk(null);
      queryClient.invalidateQueries({ queryKey: ['/api/registry-assessments'] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRiskSelection = (risk: RiskRegistry) => {
    // Prototype: Skip user info validation
    setSelectedRisk(risk);
    setShowAssessmentForm(true);
    form.setValue('riskRegistryId', risk.id);
    
    // Set default values for prototype
    form.setValue('assessorEmail', 'prototype@adata.com');
    form.setValue('assessorName', 'Prototype User');
    form.setValue('assessorDepartment', 'Prototype Department');
  };

  const onSubmit = (data: AssessmentFormData) => {
    // Use 2025 values as the current assessment
    const currentImpact = data.targetImpact;
    const currentLikelihood = data.targetLikelihood;
    const riskLevel = currentImpact * currentLikelihood;
    const targetRiskLevel = riskLevel; // Same as current for now

    // 準備真實參與者資訊
    const realParticipantInfo = {
      realAssessorName: latestParticipantInfo?.name || 'Unknown',
      realAssessorDepartment: latestParticipantInfo?.department || 'Unknown',
      realAssessorEmail: latestParticipantInfo?.email || 'unknown@company.com'
    };

    createAssessmentMutation.mutate({
      ...data,
      currentImpact,
      currentLikelihood,
      riskLevel,
      targetRiskLevel,
      ...realParticipantInfo
    });
  };

  const targetImpact = form.watch('targetImpact');
  const targetLikelihood = form.watch('targetLikelihood');
  const targetRiskLevel = targetImpact && targetLikelihood ? targetImpact * targetLikelihood : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(213,94%,42%)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Risk Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Information Form - Disabled for Prototype */}
      {!showAssessmentForm && (
        <Card className="border-gray-300 border-2 mb-6 opacity-60">
          <CardHeader className="bg-gradient-to-r from-gray-400 to-gray-500 text-white">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              評估者資訊 | Assessor Information
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                PROTOTYPE: DISABLED
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-200">
              原型版本已跳過此驗證步驟，可直接進行風險評估 | Validation disabled for prototype - proceed directly to risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email 電子郵件 *
                </label>
                <Input
                  type="email"
                  placeholder="your.email@company.com"
                  value={userInfo.email}
                  onChange={(e) => handleUserInfoChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name 姓名 *
                </label>
                <Input
                  placeholder="Your Name"
                  value={userInfo.name}
                  onChange={(e) => handleUserInfoChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department 部門 *
                </label>
                <Input
                  placeholder="Your Department"
                  value={userInfo.department}
                  onChange={(e) => handleUserInfoChange('department', e.target.value)}
                />
              </div>
            </div>
            {isUserInfoComplete && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  資訊已完成，您現在可以選擇風險項目進行評估 | Information completed, you can now select risks for assessment
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Risk Selection - Primary Entry Point for Prototype */}
      {!showAssessmentForm && (
        <Card className="border-[hsl(213,94%,42%)] border-2">
          <CardHeader className="bg-gradient-to-r from-[hsl(213,94%,42%)] to-[hsl(218,100%,34%)] text-white">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              選擇風險項目進行自評 | Select Risk for Self-Assessment
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                PROTOTYPE: ENABLED
              </Badge>
            </CardTitle>
            <CardDescription className="text-blue-100">
              從風險登記表中選擇風險項目，直接進行評估 | Select risk items from registry for immediate assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {registries.map((risk) => (
                  <Card key={risk.id} className="border-l-4 border-[hsl(213,94%,42%)] transition-all duration-200 hover:shadow-md cursor-pointer hover:bg-blue-50"
                        onClick={() => handleRiskSelection(risk)}>
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="mb-3">
                            <Badge className="bg-[hsl(213,94%,42%)] text-white text-xs mb-2">
                              策略目標 Strategic Objective
                            </Badge>
                            <h4 className="font-semibold text-[hsl(218,100%,34%)] mb-1">
                              {risk.strategicObjective}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{risk.subObjective}</p>
                          <Badge variant="outline" className="text-xs">
                            {risk.riskCategory}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 mb-1">風險情境:</p>
                          <p className="text-sm text-gray-700 line-clamp-3">{risk.riskScenario}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">主責部門:</span>
                            <span className="text-sm text-gray-600">{risk.responsibleDepartment}</span>
                          </div>
                          {risk.responsibleRiskLevel && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">當前風險等級:</span>
                              <Badge className={`${getRiskLevelColor(risk.responsibleRiskLevel)} text-xs`}>
                                {risk.responsibleRiskLevel} - {getRiskLevelText(risk.responsibleRiskLevel)}
                              </Badge>
                            </div>
                          )}
                          {risk.responseStrategy && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">回應策略:</span>
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                {risk.responseStrategy}
                              </Badge>
                            </div>
                          )}
                          {risk.warningIndicator && (
                            <div className="border-t pt-2 mt-2">
                              <div className="text-xs text-orange-600 font-medium">警戒指標</div>
                              <div className="text-xs text-gray-600 truncate">{risk.warningIndicator}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Assessment Form */}
      {showAssessmentForm && selectedRisk && (
        <div className="space-y-6">
          {/* Selected Risk Info */}
          <Card className="border-[hsl(213,94%,42%)] border-2">
            <CardHeader className="bg-gradient-to-r from-[hsl(213,94%,42%)] to-[hsl(218,100%,34%)] text-white">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                風險評估 | Risk Assessment
              </CardTitle>
              <CardDescription className="text-blue-100">
                {selectedRisk.strategicObjective} - {selectedRisk.subObjective}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <Badge className="bg-white text-[hsl(213,94%,42%)] border-[hsl(213,94%,42%)] mb-2">
                      策略目標 Strategic Objective
                    </Badge>
                    <h4 className="font-semibold text-gray-800 mb-2">{selectedRisk.strategicObjective}</h4>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">風險情境 Risk Scenario</h4>
                  <p className="text-sm text-gray-700 mb-4">{selectedRisk.riskScenario}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">現有對策 Existing Measures</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">{selectedRisk.existingMeasures}</p>
                    </div>
                    
                    {selectedRisk.warningIndicator && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">監督指標 Monitoring Indicators</h4>
                        <div className="space-y-2">
                          <div className="text-xs">
                            <span className="font-medium text-orange-600">警戒值:</span>
                            <span className="ml-2 text-gray-700">{selectedRisk.warningIndicator}</span>
                          </div>
                          {selectedRisk.actionIndicator && (
                            <div className="text-xs">
                              <span className="font-medium text-red-600">行動值:</span>
                              <span className="ml-2 text-gray-700">{selectedRisk.actionIndicator}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {selectedRisk.responseStrategy && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">風險回應策略 Response Strategy</h4>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          {selectedRisk.responseStrategy}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">風險基本資訊 Risk Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">風險類別:</span>
                      <Badge variant="outline">{selectedRisk.riskCategory}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">主責部門:</span>
                      <span>{selectedRisk.responsibleDepartment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">風險擁有者:</span>
                      <span>{selectedRisk.riskOwner}</span>
                    </div>
                    {selectedRisk.responsibleRiskLevel && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">2024單位風險等級:</span>
                        <Badge className={`${getRiskLevelColor(selectedRisk.responsibleRiskLevel)} text-xs`}>
                          {selectedRisk.responsibleRiskLevel} - {getRiskLevelText(selectedRisk.responsibleRiskLevel)}
                        </Badge>
                      </div>
                    )}
                    {selectedRisk.weightedRiskLevel && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">加權風險等級:</span>
                        <span className="text-sm font-bold text-purple-600">{selectedRisk.weightedRiskLevel}</span>
                      </div>
                    )}
                    {selectedRisk.stakeholders && (
                      <div className="flex justify-between">
                        <span className="font-medium">關係方:</span>
                        <span className="text-xs text-gray-600">{selectedRisk.stakeholders}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[hsl(218,100%,34%)]">自評表單 | Self-Assessment Form</CardTitle>
              <CardDescription>
                請根據當前營運狀況評估此風險項目
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* 2024 Risk Assessment */}
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(218,100%,34%)] mb-4">
                      2024風險評估 | 2024 Risk Assessment
                    </h3>
                    <div className="p-4 border rounded-lg bg-blue-50 mb-4">
                      <h4 className="font-medium text-gray-800 mb-3">2024年度評估結果 | 2024 Assessment Results</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">影響程度 Impact</div>
                          <div className="text-2xl font-bold text-[hsl(218,100%,34%)]">
                            {selectedRisk.responsibleImpact || 'N/A'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">可能性 Likelihood</div>
                          <div className="text-2xl font-bold text-[hsl(218,100%,34%)]">
                            {selectedRisk.responsiblePossibility || 'N/A'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-600 mb-1">風險等級 Risk Level</div>
                          {selectedRisk.responsibleRiskLevel && (
                            <Badge className={`${getRiskLevelColor(selectedRisk.responsibleRiskLevel)} text-lg px-3 py-2`}>
                              {selectedRisk.responsibleRiskLevel}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        {selectedRisk.responsibleRiskLevel && (
                          <span className="text-sm text-gray-700">
                            {getRiskLevelText(selectedRisk.responsibleRiskLevel)}
                          </span>
                        )}
                      </div>
                    </div>


                  </div>

                  <Separator />

                  {/* 2025 Risk Assessment */}
                  <div>
                    <h3 className="text-lg font-semibold text-[hsl(218,100%,34%)] mb-4">
                      2025風險評估 | 2025 Risk Assessment
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="targetImpact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>2025影響程度 2025 Impact (1-5)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select 2025 impact" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - 極低 Very Low</SelectItem>
                                <SelectItem value="2">2 - 低 Low</SelectItem>
                                <SelectItem value="3">3 - 中 Medium</SelectItem>
                                <SelectItem value="4">4 - 高 High</SelectItem>
                                <SelectItem value="5">5 - 極高 Very High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="targetLikelihood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>2025發生可能性 2025 Likelihood (1-5)</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select 2025 likelihood" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 - 極低 Very Low</SelectItem>
                                <SelectItem value="2">2 - 低 Low</SelectItem>
                                <SelectItem value="3">3 - 中 Medium</SelectItem>
                                <SelectItem value="4">4 - 高 High</SelectItem>
                                <SelectItem value="5">5 - 極高 Very High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {targetRiskLevel > 0 && (
                      <div className="mt-4 p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">2025風險等級 2025 Risk Level:</span>
                          <Badge className={`${getRiskLevelColor(targetRiskLevel)} text-sm px-3 py-1`}>
                            {targetRiskLevel} - {getRiskLevelText(targetRiskLevel)}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="assessmentNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>評估備註 Assessment Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="請說明您的評估理由或補充資訊..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mitigationActions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>建議改善措施 Recommended Mitigation Actions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="請提出具體的風險改善建議..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Optimization Suggestions */}
                  {(selectedRisk.optimizationSuggestion || selectedRisk.assessmentOptimization || selectedRisk.newRiskMeasures) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="text-yellow-600 mr-2">💡</span>
                        優化建議 Optimization Suggestions
                      </h4>
                      <div className="space-y-3 text-sm">
                        {selectedRisk.optimizationSuggestion && (
                          <div>
                            <span className="font-medium text-yellow-800">風險控制優化:</span>
                            <p className="text-gray-700 mt-1">{selectedRisk.optimizationSuggestion}</p>
                          </div>
                        )}
                        {selectedRisk.assessmentOptimization && selectedRisk.assessmentOptimization !== 'N/A' && (
                          <div>
                            <span className="font-medium text-yellow-800">評估方法優化:</span>
                            <p className="text-gray-700 mt-1">{selectedRisk.assessmentOptimization}</p>
                          </div>
                        )}
                        {selectedRisk.newRiskMeasures && (
                          <div>
                            <span className="font-medium text-yellow-800">建議新增對策:</span>
                            <p className="text-gray-700 mt-1">{selectedRisk.newRiskMeasures}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAssessmentForm(false);
                        setSelectedRisk(null);
                        form.reset();
                      }}
                    >
                      取消 Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAssessmentMutation.isPending}
                      className="bg-[hsl(213,94%,42%)] hover:bg-[hsl(218,100%,34%)]"
                    >
                      {createAssessmentMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          提交中...
                        </div>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          提交評估 Submit Assessment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RegistryBasedAssessment;