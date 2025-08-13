export const contextTexts = (topDocs: any) => topDocs
    .map((doc: { pageContent: any; }, i: number) => `Document ${i + 1}:\n${doc.pageContent}`)
    .join("\n\n---\n\n");