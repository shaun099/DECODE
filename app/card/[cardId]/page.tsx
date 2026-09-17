import { redirect } from 'next/navigation';

export default async function CardGameAlias({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  redirect(`/play/card/${cardId}`);
}
