import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DeveloperCategory({ onDisable, onResetWelcome }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Developer</CardTitle>
          <Button
            onClick={onDisable}
            variant="ghost"
            size="sm"
            className="h-6 text-[11px] text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Exit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={onResetWelcome}
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
        >
          Reset Welcome Screen
        </Button>
      </CardContent>
    </Card>
  );
}
