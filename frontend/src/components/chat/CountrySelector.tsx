import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface CountrySelectorProps {
  countries: Country[];
  selectedCountries: string[];
  onCountryToggle: (countryCode: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  placeholder: string;
}

export function CountrySelector({
  countries,
  selectedCountries,
  onCountryToggle,
  open,
  onOpenChange,
  label,
  placeholder
}: CountrySelectorProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between text-left font-normal"
        >
          <span>
            {selectedCountries.length > 0 
              ? `${selectedCountries.length} countries selected`
              : placeholder
            }
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search countries..." />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-[300px]">
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  onSelect={() => onCountryToggle(country.code)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCountries.includes(country.code) 
                        ? "opacity-100" 
                        : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{country.flag}</span>
                  {country.name}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}