interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="rounded-[8px] border border-[#D9D9D9] bg-gray-50 p-6">
      <p className="text-sm text-gray-400">
        Halaman <span className="font-medium text-gray-600">{title}</span> —
        konten akan ditambahkan.
      </p>
    </div>
  )
}
