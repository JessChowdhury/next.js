export function linkGc() {
  // TODO-APP: Remove this logic when Float has GC built-in in development.
  if (process.env.NODE_ENV !== 'production') {
    const callback = (mutationList: MutationRecord[]) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (
              'tagName' in node &&
              (node as HTMLLinkElement).tagName === 'LINK'
            ) {
              const link = node as HTMLLinkElement
              if (link.dataset.precedence?.startsWith('next')) {
                const href = link.getAttribute('href')
                if (href) {
                  const [resource, version] = href.split('?v=')
                  if (version) {
                    const allLinks = document.querySelectorAll(
                      `link[href^="${resource}"]`
                    ) as NodeListOf<HTMLLinkElement>
                    for (const otherLink of allLinks) {
                      if (otherLink.dataset.precedence?.startsWith('next')) {
                        const otherHref = otherLink.getAttribute('href')
                        if (otherHref) {
                          const [, otherVersion] = otherHref.split('?v=')
                          if (!otherVersion || +otherVersion < +version) {
                            otherLink.remove()
                            const preloadLink = document.querySelector(
                              `link[rel="preload"][as="style"][href="${otherHref}"]`
                            )
                            if (preloadLink) {
                              preloadLink.remove()
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback)
    observer.observe(document.head, {
      childList: true,
    })
  }
}
