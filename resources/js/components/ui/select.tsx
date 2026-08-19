"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react"

import { Input } from "./input"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background",
      "data-[placeholder]:text-muted-foreground",
      "focus:border-primary focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left",
      className
    )}
    {...props}
  >
    {children}

    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))

SelectTrigger.displayName =
  SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.ScrollUpButton
  >
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))

SelectScrollUpButton.displayName =
  SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.ScrollDownButton
  >
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))

SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const getSearchableText = (
  node: React.ReactNode
): string => {
  if (
    node === null ||
    node === undefined ||
    typeof node === "boolean"
  ) {
    return ""
  }

  if (
    typeof node === "string" ||
    typeof node === "number"
  ) {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node
      .map(getSearchableText)
      .join(" ")
  }

  if (
    React.isValidElement(node) &&
    (node.props as any)?.children
  ) {
    return getSearchableText(
      (node.props as any).children
    )
  }

  return ""
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Content
  > & {
    searchable?: boolean
    maxResults?: number
  }
>(
  (
    {
      className,
      children,
      position = "popper",
      searchable = false,
      maxResults = 50,
      ...props
    },
    forwardedRef
  ) => {
    const [search, setSearch] =
      React.useState("")

    const inputRef =
      React.useRef<HTMLInputElement>(null)

    const contentRef = React.useRef<HTMLDivElement | null>(null)

    const setRefs = React.useCallback(
      (
        node: HTMLDivElement | null
      ) => {
        contentRef.current = node

        if (
          typeof forwardedRef === "function"
        ) {
          forwardedRef(node)
        } else if (forwardedRef) {
          (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        }
      },
      [forwardedRef]
    )

    const childrenArray =
      React.useMemo(
        () =>
          React.Children.toArray(children),
        [children]
      )

    const filteredChildren =
      React.useMemo(() => {
        if (!searchable) {
          return childrenArray
        }

        const normalizedSearch =
          search.trim().toLowerCase()

        const filtered =
          normalizedSearch === ""
            ? childrenArray
            : childrenArray.filter(
              (child) => {
                if (
                  !React.isValidElement(
                    child
                  )
                ) {
                  return true
                }

                const text =
                  getSearchableText(
                    (
                      child.props as any
                    ).children
                  )

                return text
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
              }
            )

        return filtered.slice(
          0,
          maxResults
        )
      }, [
        childrenArray,
        search,
        searchable,
        maxResults,
      ])

    const focusSearchInput =
      React.useCallback(() => {
        if (!searchable) {
          return
        }

        requestAnimationFrame(() => {
          inputRef.current?.focus()
        })
      }, [searchable])

    const selectFirstResult =
      React.useCallback(() => {
        const firstItem =
          contentRef.current?.querySelector<HTMLElement>(
            '[role="option"]:not([data-disabled])'
          )

        firstItem?.click()
      }, [])

    const focusFirstResult =
      React.useCallback(() => {
        const firstItem =
          contentRef.current?.querySelector<HTMLElement>(
            '[role="option"]:not([data-disabled])'
          )

        firstItem?.focus()
      }, [])

    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={setRefs}
          position={position}
          className={cn(
            "relative z-50",
            "max-h-[var(--radix-select-content-available-height)]",
            "min-w-[var(--radix-select-trigger-width)]",
            "w-[var(--radix-select-trigger-width)]",
            "max-w-[min(500px,calc(100vw-2rem))]",
            "overflow-hidden rounded-md border",
            "bg-popover text-popover-foreground shadow-md",

            "data-[state=open]:animate-in",
            "data-[state=closed]:animate-out",

            "data-[state=closed]:fade-out-0",
            "data-[state=open]:fade-in-0",

            "data-[state=closed]:zoom-out-95",
            "data-[state=open]:zoom-in-95",

            "data-[side=bottom]:slide-in-from-top-2",
            "data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2",
            "data-[side=top]:slide-in-from-bottom-2",

            "origin-[--radix-select-content-transform-origin]",

            position === "popper" &&
            [
              "data-[side=bottom]:translate-y-1",
              "data-[side=left]:-translate-x-1",
              "data-[side=right]:translate-x-1",
              "data-[side=top]:-translate-y-1",
            ],

            className
          )}
          {...({
            onOpenAutoFocus: (event: Event) => {
              if (!searchable) {
                return
              }

              event.preventDefault()
              focusSearchInput()
            }
          } as any)}
          onCloseAutoFocus={() => {
            setSearch("")
          }}
          onKeyDownCapture={(event) => {
            /*
             * Radix Select has its own keyboard
             * typeahead feature.
             *
             * If the user is typing inside our
             * search input, prevent Radix from
             * stealing focus.
             */
            if (
              searchable &&
              event.target instanceof
              HTMLInputElement
            ) {
              event.stopPropagation()
            }
          }}
          {...props}
        >
          <SelectScrollUpButton />

          {searchable && (
            <div
              className={cn(
                "sticky top-0 z-10",
                "flex items-center",
                "border-b bg-popover",
                "px-3 py-2"
              )}
              onPointerDown={(
                event
              ) => {
                /*
                 * Prevent Radix from moving
                 * focus to an option when
                 * clicking search area.
                 */
                event.stopPropagation()
              }}
              onClick={(event) => {
                event.stopPropagation()

                inputRef.current?.focus()
              }}
            >
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />

              <Input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={search}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  )
                }}
                onPointerDown={(
                  event
                ) => {
                  event.stopPropagation()
                }}
                onMouseDown={(event) => {
                  event.stopPropagation()
                }}
                onClick={(event) => {
                  event.stopPropagation()
                }}
                onKeyDown={(event) => {
                  /*
                   * Very important:
                   *
                   * Prevent Radix Select from
                   * processing the typed key.
                   */
                  event.stopPropagation()

                  event.nativeEvent.stopImmediatePropagation()

                  if (
                    event.key === "Enter"
                  ) {
                    event.preventDefault()

                    selectFirstResult()

                    return
                  }

                  /*
                   * Arrow Down:
                   * move directly to first
                   * search result.
                   */
                  if (
                    event.key ===
                    "ArrowDown"
                  ) {
                    event.preventDefault()

                    focusFirstResult()

                    return
                  }

                  /*
                   * Prevent Escape etc.
                   * from affecting the text
                   * input unexpectedly.
                   *
                   * Escape still closes Select
                   * through Radix normally if
                   * desired, so we don't
                   * preventDefault here.
                   */
                }}
                onKeyUp={(event) => {
                  event.stopPropagation()

                  event.nativeEvent.stopImmediatePropagation()
                }}
                className={cn(
                  "h-8 min-w-0 flex-1",
                  "border-0 bg-transparent",
                  "p-0 shadow-none",
                  "focus-visible:ring-0",
                  "focus-visible:ring-offset-0"
                )}
              />
            </div>
          )}

          <SelectPrimitive.Viewport
            className={cn(
              "w-full overflow-y-auto p-1",
              "max-h-[300px]"
            )}
          >
            {filteredChildren}

            {searchable &&
              search.trim() !== "" &&
              filteredChildren.length ===
              0 && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
          </SelectPrimitive.Viewport>

          <SelectScrollDownButton />
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    )
  }
)

SelectContent.displayName =
  SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Label
  >
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "py-1.5 pl-8 pr-2 text-left text-sm font-semibold",
      className
    )}
    {...props}
  />
))

SelectLabel.displayName =
  SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Item
  >
>(
  (
    {
      className,
      children,
      ...props
    },
    ref
  ) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full min-w-0 cursor-default select-none items-center rounded-sm",
        "py-1.5 pl-8 pr-2",
        "text-left text-sm outline-none",

        "focus:bg-accent",
        "focus:text-accent-foreground",

        "data-[disabled]:pointer-events-none",
        "data-[disabled]:opacity-50",

        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText>
        <span className="block min-w-0 truncate text-left">
          {children}
        </span>
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
)

SelectItem.displayName =
  SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<
    typeof SelectPrimitive.Separator
  >,
  React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Separator
  >
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-1 my-1 h-px bg-muted",
      className
    )}
    {...props}
  />
))

SelectSeparator.displayName =
  SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}