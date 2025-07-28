import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

const participantSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  department: z.string().min(1, "Department is required"),
});

type ParticipantData = z.infer<typeof participantSchema>;

interface ParticipantFormProps {
  onDataChange: (data: ParticipantData | null) => void;
}

export function ParticipantForm({ onDataChange }: ParticipantFormProps) {
  const form = useForm<ParticipantData>({
    resolver: zodResolver(participantSchema),
    defaultValues: {
      email: "",
      name: "",
      department: "",
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();

  // Update parent component when form data changes and is valid
  const handleFormChange = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      onDataChange(watchedValues);
    } else {
      onDataChange(null);
    }
  };

  return (
    <Card className="form-shadow mb-8">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <User className="text-[hsl(213,94%,42%)] text-2xl mr-3" />
          <h2 className="text-2xl font-semibold text-[hsl(218,100%,34%)]">Participant Information / 填寫人資訊</h2>
        </div>
        
        <Form {...form}>
          <form className="space-y-6" onChange={handleFormChange}>
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[hsl(0,0%,26%)]">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="email"
                        placeholder="your.email@company.com"
                        className="px-4 py-3 focus:ring-2 focus:ring-[hsl(213,94%,42%)] focus:border-transparent transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[hsl(0,0%,26%)]">
                      Name / 姓名 <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Your Full Name"
                        className="px-4 py-3 focus:ring-2 focus:ring-[hsl(213,94%,42%)] focus:border-transparent transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[hsl(0,0%,26%)]">
                    Department/Unit / 部門/單位 <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      placeholder="Your Department or Unit"
                      className="px-4 py-3 focus:ring-2 focus:ring-[hsl(213,94%,42%)] focus:border-transparent transition-all duration-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
