interface CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function Card({ title, description, icon }: CardProps) {
  return (
    <div
      className="
        w-[260px] h-[180px]
        flex flex-col justify-between
        rounded-xl border border-gray-200
        bg-white p-5
        shadow-sm
        hover:border-red-300 transition-colors
      "
    >
      {icon && <div className="text-red-500 mb-2">{icon}</div>}
      <div>
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  );
}