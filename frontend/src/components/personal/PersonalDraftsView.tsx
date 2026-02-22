import { Plus, Upload, MessageSquare, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const drafts = [
  {
    id: 'd1',
    title: 'Customer Segmentation Analysis Draft',
    type: 'AI-Assisted Analysis',
    lastModified: '2025-10-11',
    content: 'Initial analysis using AI to identify customer segments...',
    aiQueries: 12,
  },
  {
    id: 'd2',
    title: 'Market Research Summary',
    type: 'Report Draft',
    lastModified: '2025-10-10',
    content: 'Comprehensive market research findings for RetailMax...',
    aiQueries: 8,
  },
  {
    id: 'd3',
    title: 'Q4 Campaign Recommendations',
    type: 'AI-Assisted Reasoning',
    lastModified: '2025-10-09',
    content: 'Strategic recommendations based on campaign performance data...',
    aiQueries: 15,
  },
];

export function PersonalDraftsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Drafts</h1>
          <p className="text-gray-600 mt-1">AI-assisted reasoning and draft deliverables before publishing</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Draft
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {drafts.map((draft) => (
          <Card key={draft.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <CardTitle>{draft.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    Last modified: {new Date(draft.lastModified).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{draft.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{draft.content}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{draft.aiQueries} AI queries</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  Continue Editing
                </Button>
                <Button size="sm" className="flex-1">
                  <Upload className="w-4 h-4 mr-1" />
                  Publish to Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-center">Start a New Draft</CardTitle>
          <CardDescription className="text-center">
            Use AI assistance to develop your ideas before sharing with the team
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Draft
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm">
                <strong>Tip:</strong> All drafts are private by default. Use AI to refine your analysis and reasoning before publishing deliverables to your team projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
