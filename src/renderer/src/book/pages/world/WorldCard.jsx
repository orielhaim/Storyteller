import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import useImageLoader from '@/hooks/useImageLoader';
import { Globe, ExternalLink, Trash2 } from 'lucide-react';

function WorldCard({ world, onClick, onDelete }) {
  const imageData = useImageLoader(world.referenceImage);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onClick && onClick(world)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => onDelete && onDelete(world)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default WorldCard;