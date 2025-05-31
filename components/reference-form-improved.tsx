import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { trpc } from "../lib/trpc";
import { useRouter } from "next/router";
import { useToast } from "../hooks/use-toast";

const referenceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  type: z.enum(["article", "book", "conference", "thesis", "website"]),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  journal: z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  pages: z.string().optional(),
  publisher: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type ReferenceFormData = z.infer<typeof referenceSchema>;

interface ReferenceFormProps {
  initialData?: Partial<ReferenceFormData>;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  referenceId?: string;
}

export default function ReferenceFormImproved({
  initialData,
  onSuccess,
  mode = "create",
  referenceId,
}: ReferenceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [authorInput, setAuthorInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  const form = useForm<ReferenceFormData>({
    resolver: zodResolver(referenceSchema),
    defaultValues: {
      title: initialData?.title || "",
      authors: initialData?.authors || [],
      type: initialData?.type || "article",
      year: initialData?.year || new Date().getFullYear(),
      journal: initialData?.journal || "",
      volume: initialData?.volume || "",
      issue: initialData?.issue || "",
      pages: initialData?.pages || "",
      publisher: initialData?.publisher || "",
      doi: initialData?.doi || "",
      url: initialData?.url || "",
      tags: initialData?.tags || [],
      notes: initialData?.notes || "",
    },
  });

  const createMutation = trpc.references.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reference created successfully",
      });
      onSuccess?.();
      router.push("/references");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = trpc.references.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reference updated successfully",
      });
      onSuccess?.();
      router.push(`/references/${referenceId}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReferenceFormData) => {
    if (mode === "create") {
      createMutation.mutate(data);
    } else if (mode === "edit" && referenceId) {
      updateMutation.mutate({ id: referenceId, data });
    }
  };

  const addAuthor = () => {
    if (authorInput.trim()) {
      const currentAuthors = form.getValues("authors");
      form.setValue("authors", [...currentAuthors, authorInput.trim()]);
      setAuthorInput("");
    }
  };

  const removeAuthor = (index: number) => {
    const currentAuthors = form.getValues("authors");
    form.setValue(
      "authors",
      currentAuthors.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags");
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((_, i) => i !== index)
    );
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Add New Reference" : "Edit Reference"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter reference title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reference type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="thesis">Thesis</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Authors */}
            <div>
              <FormLabel>Authors *</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter author name"
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAuthor())
                    }
                  />
                  <Button type="button" onClick={addAuthor} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("authors").map((author, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {author}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeAuthor(index)}
                      />
                    </Badge>
                  ))}
                </div>
                {form.formState.errors.authors && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.authors.message}
                  </p>
                )}
              </div>
            </div>

            {/* Publication Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="journal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Journal/Publisher</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Journal or publisher name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher</FormLabel>
                    <FormControl>
                      <Input placeholder="Publisher name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <FormControl>
                      <Input placeholder="Volume number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue</FormLabel>
                    <FormControl>
                      <Input placeholder="Issue number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pages</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123-456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DOI</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digital Object Identifier"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div>
              <FormLabel>Tags</FormLabel>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch("tags").map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or comments"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "create"
                  ? "Create Reference"
                  : "Update Reference"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
