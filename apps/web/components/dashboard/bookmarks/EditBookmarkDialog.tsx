import * as React from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { useUpdateBookmark } from "@hoarder/shared-react/hooks/bookmarks";
import {
  BookmarkTypes,
  ZBookmark,
  ZUpdateBookmarksRequest,
  zUpdateBookmarksRequestSchema,
} from "@hoarder/shared/types/bookmarks";

import { BookmarkTagsEditor } from "./BookmarkTagsEditor";

const formSchema = zUpdateBookmarksRequestSchema;

export function EditBookmarkDialog({
  open,
  setOpen,
  bookmark,
  children,
}: {
  bookmark: ZBookmark;
  children?: React.ReactNode;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const bookmarkToDefault = (bookmark: ZBookmark) => ({
    bookmarkId: bookmark.id,
    title:
      bookmark.title ??
      (bookmark.content.type === BookmarkTypes.LINK
        ? bookmark.content.title
        : undefined),
    createdAt: bookmark.createdAt ?? new Date(),
    // Link specific defaults (only if bookmark is a link)
    url:
      bookmark.content.type === BookmarkTypes.LINK
        ? bookmark.content.url
        : undefined,
    description:
      bookmark.content.type === BookmarkTypes.LINK
        ? (bookmark.content.description ?? "") // Use empty string for textarea
        : undefined,
    author:
      bookmark.content.type === BookmarkTypes.LINK
        ? (bookmark.content.author ?? "")
        : undefined,
    publisher:
      bookmark.content.type === BookmarkTypes.LINK
        ? (bookmark.content.publisher ?? "")
        : undefined,
    datePublished:
      bookmark.content.type === BookmarkTypes.LINK
        ? bookmark.content.datePublished
        : undefined,
    dateModified:
      bookmark.content.type === BookmarkTypes.LINK
        ? bookmark.content.dateModified
        : undefined,
  });

  const form = useForm<ZUpdateBookmarksRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: bookmarkToDefault(bookmark),
  });

  const { mutate: updateBookmarkMutate, isPending: isUpdatingBookmark } =
    useUpdateBookmark({
      onSuccess: (updatedBookmark) => {
        toast({ description: "Bookmark details updated successfully!" });
        // Close the dialog after successful detail update
        setOpen(false);
        // Reset form with potentially updated data
        form.reset(bookmarkToDefault(updatedBookmark));
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Failed to update bookmark",
          description: error.message,
        });
      },
    });

  function onSubmit(values: ZUpdateBookmarksRequest) {
    // Ensure optional fields that are empty strings are sent as null/undefined if appropriate
    const payload = {
      ...values,
      title: values.title ?? null,
    };
    updateBookmarkMutate(payload);
  }

  // Reset form when bookmark data changes externally or dialog reopens
  React.useEffect(() => {
    if (open) {
      form.reset({
        bookmarkId: bookmark.id,
        title: bookmark.title ?? "",
        createdAt: bookmark.createdAt ?? new Date(),
        url:
          bookmark.content.type === BookmarkTypes.LINK
            ? bookmark.content.url
            : undefined,
        description:
          bookmark.content.type === BookmarkTypes.LINK
            ? (bookmark.content.description ?? "") // Use empty string for textarea
            : undefined,
        author:
          bookmark.content.type === BookmarkTypes.LINK
            ? (bookmark.content.author ?? "")
            : undefined,
        publisher:
          bookmark.content.type === BookmarkTypes.LINK
            ? (bookmark.content.publisher ?? "")
            : undefined,
        datePublished:
          bookmark.content.type === BookmarkTypes.LINK
            ? bookmark.content.datePublished
            : undefined,
        dateModified:
          bookmark.content.type === BookmarkTypes.LINK
            ? bookmark.content.dateModified
            : undefined,
      });
    }
  }, [bookmark, form, open]);

  const isLink = bookmark.content.type === BookmarkTypes.LINK;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>
            Make changes to the bookmark details. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bookmark title"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isLink && (
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isLink && (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bookmark description"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isLink && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Author name"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publisher</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Publisher name"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="createdAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Created At</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isLink && (
                <FormField
                  control={form.control}
                  name="datePublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Published</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ?? undefined} // Calendar expects Date | undefined
                            onSelect={(date) => field.onChange(date ?? null)} // Handle undefined -> null
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {isLink && (
              <FormField
                control={form.control}
                name="dateModified"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Modified</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={(date) => field.onChange(date ?? null)}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <BookmarkTagsEditor bookmark={bookmark} />
              </FormControl>
              <FormMessage />
            </FormItem>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isUpdatingBookmark}
              >
                Cancel
              </Button>
              <ActionButton type="submit" loading={isUpdatingBookmark}>
                Save changes
              </ActionButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
