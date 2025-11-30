export const ContactList = () => {
  return (
    <div className="w-full rounded-2xl flex flex-col bg-neutral-100 p-4">
      <p className="text-xl font-bold text-sky-500">Bạn bè đang hoạt động</p>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-2 hover:bg-gray-200 rounded-lg cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          <div className="flex-1">
            <p className="font-medium">Nguyễn Văn A</p>
            <p className="text-sm text-green-500">Đang hoạt động</p>
          </div>
        </div>
      ))}
    </div>
  )
}