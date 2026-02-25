import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { RiFilter2Fill } from "@remixicon/react";

export default function FilterDropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          size="sm"
          variant="flat"
          startContent={<RiFilter2Fill size={18} className="text-default-400" />}
          className="h-7 px-2.5 text-xs font-medium text-default-600 bg-default-100 data-[hover=true]:bg-default-200 border border-divider gap-1"
        >
          {value === options[0] ? label : (
            <span className="text-primary font-semibold capitalize">{value}</span>
          )}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`${label} filter`}
        selectionMode="single"
        selectedKeys={new Set([value])}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as T;
          if (selected) onChange(selected);
        }}
        itemClasses={{
          base: "text-xs text-default-600 data-[selected=true]:text-primary data-[selected=true]:font-semibold",
        }}
      >
        {options.map((d) => (
          <DropdownItem key={d} className="capitalize">
            {d}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}