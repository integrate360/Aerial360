import { GrPrevious } from "react-icons/gr";

const SectionHeader = ({
  title,
  isPrev,
  prev,
}: {
  title: string;
  isPrev: boolean;
  prev: (e: number) => void;
}) => {
  return (
    <div className="section-header">
      {isPrev && (
        <div className="section-header-prev" onClick={() => prev(4)}>
          <GrPrevious fontWeight={"600"} fontSize={"12"} />
        </div>
      )}
      {title}
    </div>
  );
};

export default SectionHeader;
