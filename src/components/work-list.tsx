import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import type { Role } from "@/lib/site";

export function WorkList({ roles }: { roles: Role[] }) {
  return (
    <ItemGroup className="-mx-3 w-auto gap-1">
      {roles.map((role) => (
        <Item key={`${role.company}-${role.years}`} role="listitem" className="reveal items-start">
          <ItemContent>
            <ItemTitle className="line-clamp-none text-base font-semibold">
              {role.company}
            </ItemTitle>
            <ItemDescription className="line-clamp-none">{role.title}</ItemDescription>
            {role.note !== undefined && <p className="mt-1 text-sm/relaxed">{role.note}</p>}
          </ItemContent>
          <ItemActions>
            <Badge variant="secondary" className="tabular-nums">
              {role.years}
            </Badge>
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}
