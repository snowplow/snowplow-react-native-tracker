export function createTracker(...trackerArgs) {
  const setSubjectData = (...args) => Promise.resolve(undefined);
  const trackScreenViewEvent = (...args) => Promise.resolve(undefined);
  const trackSelfDescribingEvent = (...args) => Promise.resolve(undefined);
  const trackStructuredEvent = Promise.resolve(undefined);
  const trackPageViewEvent = Promise.resolve(undefined);

  return Object.freeze({
    setSubjectData,
    trackScreenViewEvent,
    trackSelfDescribingEvent,
    trackStructuredEvent,
    trackPageViewEvent,
  });
}
