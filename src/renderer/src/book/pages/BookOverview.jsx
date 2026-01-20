import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Calendar,
  User,
  Globe,
  Users,
  FileText,
  ListOrdered,
  Map,
  PersonStanding,
  Activity,
} from 'lucide-react';
import useImageLoader from '@/hooks/useImageLoader';

function BookOverview({ book }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatNumber = (value) => {
    if (value == null) return '0';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchOverview = async () => {
      if (!book?.id || !window?.bookAPI?.books?.getOverview) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await window.bookAPI.books.getOverview(book.id);
        if (!isMounted) return;
        if (res?.success) {
          setOverview(res.data);
        } else {
          setError(res?.error || 'Failed to load book overview');
        }
      } catch (e) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load book overview');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, [book?.id]);

  const stats = overview?.stats || {};

  const writingSpan = useMemo(() => {
    if (!stats.writingPeriod?.firstSceneAt || !stats.writingPeriod?.lastSceneAt) {
      return null;
    }
    const start = new Date(stats.writingPeriod.firstSceneAt);
    const end = new Date(stats.writingPeriod.lastSceneAt);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    return {
      startLabel: formatDate(stats.writingPeriod.firstSceneAt),
      endLabel: formatDate(stats.writingPeriod.lastSceneAt),
      days,
    };
  }, [stats.writingPeriod]);

  const sceneStatusEntries = useMemo(() => {
    if (!stats.sceneStatusCounts) return [];
    return Object.entries(stats.sceneStatusCounts)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
  }, [stats.sceneStatusCounts]);

  const imageUrl = useImageLoader(book.image);

  return (
    <div className="space-y-8 pb-8">
      <Card className="overflow-hidden">
        <div className="relative">
          {imageUrl && (
            <div className="absolute inset-0 bg-linear-to-r from-background/80 to-background/40 z-10" />
          )}
          <div className="relative z-20 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={book.name}
                    className="w-44 h-64 md:w-48 md:h-72 object-cover rounded-xl shadow-lg border border-border/60"
                  />
                ) : (
                  <div className="w-44 h-64 md:w-48 md:h-72 bg-muted rounded-xl flex items-center justify-center border border-dashed border-border">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-5">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                      {book.name}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{book.author}</span>
                    </p>
                  </div>
                </div>

                {book.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Logline
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base line-clamp-3">
                      {book.description}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-1">
                  <Badge variant="secondary" className="gap-2 px-3 py-1.5 text-xs md:text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {book.progressStatus === 'not_started'
                        ? 'Not Started'
                        : book.progressStatus === 'in_progress'
                          ? 'In Progress'
                          : book.progressStatus === 'completed'
                            ? 'Completed'
                            : 'Future'}
                    </span>
                  </Badge>

                  {typeof stats.words?.total === 'number' && stats.words.total > 0 && (
                    <Badge variant="outline" className="gap-2 px-3 py-1.5 text-xs md:text-sm">
                      <FileText className="h-4 w-4" />
                      <span>{formatNumber(stats.words.total)} words</span>
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Audience
                    </span>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {book.targetAudience || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Language
                    </span>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">
                        {book.primaryLanguage || 'en'}
                      </span>
                    </div>
                  </div>

                  {book.genres && book.genres.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Genres
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {book.genres.map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-[11px]">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle>Project Snapshot</CardTitle>
            {error && !loading && (
              <span className="text-xs text-destructive">Failed to load statistics</span>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-card/60 p-4 flex flex-col gap-3"
                  >
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="rounded-lg border bg-card/60 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Chapters
                    </span>
                    <ListOrdered className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatNumber(stats.chapters || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Structural backbone of your book
                  </p>
                </div>

                <div className="rounded-lg border bg-card/60 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Scenes
                    </span>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatNumber(stats.scenes || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Individual beats driving the narrative
                  </p>
                </div>

                <div className="rounded-lg border bg-card/60 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Words
                    </span>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatNumber(stats.words?.total || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Approximate total words across all scenes
                  </p>
                </div>

                <div className="rounded-lg border bg-card/60 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Characters
                    </span>
                    <PersonStanding className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatNumber(stats.characters || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Profiles tracked for this story
                  </p>
                </div>

                <div className="rounded-lg border bg-card/60 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Worlds & Locations
                    </span>
                    <Map className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatNumber((stats.worlds || 0) + (stats.locations || 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Settings available for scenes
                  </p>
                </div>

                <div className="rounded-lg border bg-card/60 p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Objects
                    </span>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatNumber(stats.objects || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Story-relevant artifacts and items
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Writing Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : (
              <>
                {writingSpan ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Writing period
                        </span>
                        <span className="text-sm">
                          {writingSpan.startLabel} → {writingSpan.endLabel}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        {writingSpan.days} days
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Start writing scenes to see your activity timeline.
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Average words per scene
                    </span>
                    <span className="text-sm font-medium">
                      {formatNumber(stats.words?.averagePerScene || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Average scenes per chapter
                    </span>
                    <span className="text-sm font-medium">
                      {stats.structure?.scenesPerChapter
                        ? stats.structure.scenesPerChapter
                        : '0'}
                    </span>
                  </div>
                </div>

                {sceneStatusEntries.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Scene status breakdown
                    </span>
                    <div className="space-y-1.5">
                      {sceneStatusEntries.map((entry) => (
                        <div
                          key={entry.key}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="capitalize text-muted-foreground">
                            {entry.key === 'unspecified' ? 'Unspecified' : entry.key.replace(/_/g, ' ')}
                          </span>
                          <span className="font-medium">
                            {formatNumber(entry.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BookOverview;
