import { Component } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.handleReset,
        });
      }

      const componentName = this.props.name || 'Component';

      return (
        <Card className="m-4">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive opacity-70" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-destructive">
                {componentName} failed to render
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                An unexpected error occurred. You can try reloading this
                component.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left mt-4 p-3 bg-muted rounded-lg text-xs">
                  <summary className="cursor-pointer font-medium text-muted-foreground">
                    Error details (dev only)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap wrap-break-word text-destructive">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
            <Button
              onClick={this.handleReset}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
