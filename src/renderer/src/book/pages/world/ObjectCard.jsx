import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import useImageLoader from '@/hooks/useImageLoader';
import { Package, ExternalLink, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function ObjectCard({ object, onClick, onDelete }) {
  const { t } = useTranslation(['world', 'common']);
  const imageData = useImageLoader(object.referenceImage);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className="h-48 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onClick && onClick(object)}
        >
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarImage src={`data:image/jpeg;${imageData}`} alt={object.name} />
                <AvatarFallback>
                  <Package className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">{object.name}</h3>
                {object.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {object.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-auto flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {t('world:badges.object')}
              </Badge>
              {object.groups && object.groups.length > 0 && (
                object.groups.slice(0, 2).map((group, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {group}
                  </Badge>
                ))
              )}
              {object.groups && object.groups.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{object.groups.length - 2}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onClick && onClick(object)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('open')}
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => onDelete && onDelete(object)}>
          <Trash2 className="h-4 w-4 mr-2" />
          {t('delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default ObjectCard;