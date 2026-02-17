import { useEffect } from 'react';

/**
 * Hook to handle unsaved changes protection for browser navigation.
 * Handles both window close/refresh (beforeunload) and browser back button (popstate).
 */
export function useUnsavedChanges(
    hasUnsavedChanges: boolean,
    setShowDiscardSheet: (show: boolean) => void,
    isConfirmedLeave: boolean
) {
    useEffect(() => {
        // Only set up listeners if we have unsaved changes and haven't confirmed leaving
        if (!hasUnsavedChanges || isConfirmedLeave) return;

        // Handle browser close/refresh
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ''; // Required for Chrome
        };

        // Handle browser back button
        const handlePopState = (e: PopStateEvent) => {
            // Prevent going back by pushing state again
            // This effectively keeps the user on the current page while showing the modal
            window.history.pushState(null, '', window.location.href);
            setShowDiscardSheet(true);
        };

        // Add listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Initial push to history stack so we can intercept the "pop"
        // This creates a state that the user can "back" into, which triggers our handler
        window.history.pushState(null, '', window.location.href);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges, isConfirmedLeave, setShowDiscardSheet]);
}
