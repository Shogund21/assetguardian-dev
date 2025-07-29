import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { marked } from "marked";
import DOMPurify from 'dompurify';

interface DocumentationViewerProps {
  path: string;
}

const DocumentationViewer = ({ path }: DocumentationViewerProps) => {
  const [content, setContent] = useState<string>("");
  const [parsedContent, setParsedContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(path);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error loading documentation:", error);
        setContent("Error loading documentation content.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [path]);

  useEffect(() => {
    const processContent = async () => {
      if (content) {
        const htmlContent = await marked(content);
        const sanitizedContent = DOMPurify.sanitize(htmlContent, {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote'],
          ALLOWED_ATTR: ['href', 'target', 'rel']
        });
        setParsedContent(sanitizedContent);
      }
    };

    processContent();
  }, [content]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentationViewer;
