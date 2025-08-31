function Center(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className="h-full flex items-center justify-center flex-col gap-3"
    />
  );
}

export default Center;
