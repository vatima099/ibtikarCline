import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "next-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const referenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  client: z.string().min(1, "Client is required"),
  country: z.string().min(1, "Country is required"),
  location: z.string().optional(),
  employeesInvolved: z
    .number()
    .int()
    .min(1, "Number of employees involved is required"),
  budget: z.string().optional(),
  status: z.enum(["En cours", "Completed"]),
  priority: z.enum(["High", "Medium", "Low"]),
  responsible: z.string().min(1, "Responsible person is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  technologies: z
    .array(z.string())
    .min(1, "At least one technology is required"),
  keywords: z.array(z.string()).default([]),
  screenshots: z.array(z.string()).default([]),
  completionCertificate: z.string().optional(),
  otherDocuments: z.array(z.string()).default([]),
});

type ReferenceFormData = z.infer<typeof referenceSchema>;

interface ReferenceFormProps {
  onSubmit: (data: ReferenceFormData) => void;
  initialData?: Partial<ReferenceFormData>;
  isLoading?: boolean;
}

export default function ReferenceForm({
  onSubmit,
  initialData,
  isLoading,
}: ReferenceFormProps) {
  const { t } = useTranslation("common");
  const [newTechnology, setNewTechnology] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  const { data: filterOptions } = trpc.references.getFilterOptions.useQuery();
  const { data: clients } = trpc.masterData.clients.getAll.useQuery();
  const { data: countries } = trpc.masterData.countries.getAll.useQuery();
  const { data: technologies } = trpc.masterData.technologies.getAll.useQuery();

  const form = useForm<ReferenceFormData>({
    resolver: zodResolver(referenceSchema),
    defaultValues: {
      title: "",
      description: "",
      client: "",
      country: "",
      location: "",
      employeesInvolved: 1,
      budget: "",
      status: "En cours",
      priority: "Medium",
      responsible: "",
      startDate: "",
      endDate: "",
      technologies: [],
      keywords: [],
      screenshots: [],
      completionCertificate: "",
      otherDocuments: [],
      ...initialData,
    },
  });

  const watchedTechnologies = form.watch("technologies");
  const watchedKeywords = form.watch("keywords");
  const watchedStatus = form.watch("status");

  const addTechnology = () => {
    if (
      newTechnology.trim() &&
      !watchedTechnologies.includes(newTechnology.trim())
    ) {
      form.setValue("technologies", [
        ...watchedTechnologies,
        newTechnology.trim(),
      ]);
      setNewTechnology("");
    }
  };

  const removeTechnology = (tech: string) => {
    form.setValue(
      "technologies",
      watchedTechnologies.filter((t) => t !== tech)
    );
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !watchedKeywords.includes(newKeyword.trim())) {
      form.setValue("keywords", [...watchedKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    form.setValue(
      "keywords",
      watchedKeywords.filter((k) => k !== keyword)
    );
  };

  const handleSubmit = (data: ReferenceFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("referenceForm.basicInformation.title")}</CardTitle>
            <CardDescription>
              {t("referenceForm.basicInformation.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.basicInformation.projectTitle")} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "referenceForm.basicInformation.projectTitlePlaceholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.basicInformation.client")} *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "referenceForm.basicInformation.clientPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client: any) => (
                          <SelectItem key={client.id} value={client.name}>
                            {client.name}
                          </SelectItem>
                        ))}
                        {filterOptions?.clients.map((client: string) => (
                          <SelectItem key={client} value={client}>
                            {client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("referenceForm.basicInformation.description")} *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        "referenceForm.basicInformation.descriptionPlaceholder"
                      )}
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("referenceForm.basicInformation.descriptionHelper")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Location & Team */}
        <Card>
          <CardHeader>
            <CardTitle>{t("referenceForm.locationTeam.title")}</CardTitle>
            <CardDescription>
              {t("referenceForm.locationTeam.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.locationTeam.country")} *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "referenceForm.locationTeam.countryPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map((country: any) => (
                          <SelectItem key={country.id} value={country.name}>
                            {country.name}
                          </SelectItem>
                        ))}
                        {filterOptions?.countries.map((country: string) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.locationTeam.location")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "referenceForm.locationTeam.locationPlaceholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeesInvolved"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.locationTeam.employeesInvolved")} *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder={t(
                          "referenceForm.locationTeam.employeesInvolvedPlaceholder"
                        )}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.locationTeam.responsible")} *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "referenceForm.locationTeam.responsiblePlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filterOptions?.responsiblePersons.map(
                          (person: string) => (
                            <SelectItem key={person} value={person}>
                              {person}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.locationTeam.budget")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          "referenceForm.locationTeam.budgetPlaceholder"
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("referenceForm.locationTeam.budgetHelper")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>{t("referenceForm.statusTimeline.title")}</CardTitle>
            <CardDescription>
              {t("referenceForm.statusTimeline.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.statusTimeline.status")} *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "referenceForm.statusTimeline.statusPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="En cours">
                          {t("referenceForm.status.inProgress")}
                        </SelectItem>
                        <SelectItem value="Completed">
                          {t("referenceForm.status.completed")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.statusTimeline.priority")} *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              "referenceForm.statusTimeline.priorityPlaceholder"
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="High">
                          {t("referenceForm.priority.high")}
                        </SelectItem>
                        <SelectItem value="Medium">
                          {t("referenceForm.priority.medium")}
                        </SelectItem>
                        <SelectItem value="Low">
                          {t("referenceForm.priority.low")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("referenceForm.statusTimeline.startDate")} *
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchedStatus === "Completed" && (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("referenceForm.statusTimeline.endDate")}
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Technologies */}
        <Card>
          <CardHeader>
            <CardTitle>{t("referenceForm.technologies.title")}</CardTitle>
            <CardDescription>
              {t("referenceForm.technologies.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder={t(
                  "referenceForm.technologies.addTechnologyPlaceholder"
                )}
                value={newTechnology}
                onChange={(e) => setNewTechnology(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTechnology())
                }
              />
              <Button type="button" onClick={addTechnology} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {watchedTechnologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTechnologies.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-sm text-red-600">
              {form.formState.errors.technologies?.message}
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle>{t("referenceForm.keywords.title")}</CardTitle>
            <CardDescription>
              {t("referenceForm.keywords.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder={t("referenceForm.keywords.addKeywordPlaceholder")}
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addKeyword())
                }
              />
              <Button type="button" onClick={addKeyword} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {watchedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedKeywords.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline">
            {t("referenceForm.buttons.cancel")}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t("referenceForm.buttons.saving")
              : t("referenceForm.buttons.saveReference")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
