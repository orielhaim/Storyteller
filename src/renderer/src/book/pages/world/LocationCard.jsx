import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import useImageLoader from '@/hooks/useImageLoader';
import { MapPin, ExternalLink, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function LocationCard({ location, worlds, onClick, onDelete }) {
  const { t } = useTranslation(['world', 'common']);
  const imageData = useImageLoader(location.referenceImage);
  const world = worlds.find(w => w.id === location.worldId);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className="h-48 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onClick && onClick(location)}
        >
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarImage src={`data:image/jpeg;${imageData}`} alt={location.name} />
                <AvatarFallback>
                  <MapPin className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">{location.name}</h3>
                {(location.city || location.state || location.nation) && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {[location.city, location.state, location.nation].filter(Boolean).join(', ')}
                  </p>
                )}
                {location.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {location.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {t('world:badges.location')}
              </Badge>
              {world && (
                <Badge variant="secondary" className="text-xs">
                  {world.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onClick && onClick(location)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('open')}
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => onDelete && onDelete(location)}>
          <Trash2 className="h-4 w-4 mr-2" />
          {t('delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default LocationCard;