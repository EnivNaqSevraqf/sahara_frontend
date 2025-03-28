import FormViewer from "./formviewer";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
  
    return <FormViewer id={id} />;
  }