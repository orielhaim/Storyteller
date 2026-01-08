import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool } from 'lucide-react';

function BookWrite({ book }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Writing Workspace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-20 text-muted-foreground">
            <PenTool className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">Writing Interface Coming Soon</h3>
            <p>This is where you'll write your story for "{book.name}"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookWrite;