import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useImageLoader from '@/hooks/useImageLoader';
import { Globe } from 'lucide-react';

function WorldCard({ world, onClick }) {
  const imageData = useImageLoader(world.referenceImage);

  return (
    <Card
      className="h-48 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick && onClick(world)}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-12 h-12 shrink-0">
            <AvatarImage src={`data:image/jpeg;${imageData}`} alt={world.name} />
            <AvatarFallback>
              <Globe className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 truncate">{world.name}</h3>
            {world.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {world.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <Badge variant="outline" className="text-xs">
            World
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default WorldCard;