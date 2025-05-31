import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileText, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export type ReferenceType = 'book' | 'journal' | 'conference' | 'website' | 'other';

export interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: ReferenceType;
  status?: 'active' | 'archived';
  hasAttachments?: boolean;
}

interface ReferenceCardProps {
  reference: Reference;
  onDelete?: (id: string) => void;
}

export function ReferenceCard({ reference, onDelete }: ReferenceCardProps) {
  const typeColors: Record<ReferenceType, string> = {
    book: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    journal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    conference: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    website: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-2">{reference.title}</CardTitle>
          <Badge className={`${typeColors[reference.type]} capitalize`}>
            {reference.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-2 text-sm text-muted-foreground">
          {reference.authors.join(', ')} ({reference.year})
        </div>
        {reference.status === 'archived' && (
          <Badge variant="outline" className="text-muted-foreground">Archived</Badge>
        )}
        {reference.hasAttachments && (
          <Badge variant="outline" className="ml-2">
            <FileText className="h-3 w-3 mr-1" />
            Has attachments
          </Badge>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-end gap-2">
        <Link href={`/references/${reference.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
        <Link href={`/references/${reference.id}/edit`}>
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(reference.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}