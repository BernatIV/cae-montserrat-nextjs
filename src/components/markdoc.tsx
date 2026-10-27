import Markdoc, { Tag, type Config, type Node, type RenderableTreeNode } from "@markdoc/markdoc";
import Image from "next/image";
import Link from "next/link";
import React, { type ReactNode } from "react";
import { getLocalImageSize } from "@/lib/images";
import { isInternalHref, normalizeHref } from "@/lib/routes";

const config: Config = {
  nodes: {
    image: {
      render: "ContentImage",
      attributes: {
        src: { type: String, required: true },
        alt: { type: String },
        title: { type: String },
      },
      transform(node, config) {
        const attributes = node.transformAttributes(config);
        const size = getLocalImageSize(String(attributes.src));
        return new Tag("ContentImage", { ...attributes, ...size });
      },
    },
    link: {
      render: "ContentLink",
      attributes: {
        href: { type: String, required: true },
        title: { type: String },
      },
      transform(node, config) {
        const attributes = node.transformAttributes(config);
        return new Tag(
          "ContentLink",
          { ...attributes, href: normalizeHref(String(attributes.href)) },
          node.transformChildren(config),
        );
      },
    },
    table: {
      render: "ContentTable",
    },
  },
};

type ContentImageProps = {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
};

const contentImageSizes = "(min-width: 768px) 720px, 100vw";

function ContentImage({ src, alt = "", title, width, height }: ContentImageProps) {
  if (width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        title={title}
        width={width}
        height={height}
        sizes={contentImageSizes}
        className="h-auto max-h-[36rem] w-auto max-w-full rounded-lg"
      />
    );
  }
  // Remote or unreadable images: no intrinsic size available.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      title={title}
      loading="lazy"
      className="h-auto max-h-[36rem] w-auto max-w-full rounded-lg"
    />
  );
}

function ContentLink({
  href,
  title,
  children,
}: {
  href: string;
  title?: string;
  children: ReactNode;
}) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} title={title}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} title={title}>
      {children}
    </a>
  );
}

function ContentTable({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm [&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_th]:border-b-2 [&_th]:border-ink [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-ink">
        {children}
      </table>
    </div>
  );
}

const components = { ContentImage, ContentLink, ContentTable };

export function renderMarkdoc(node: Node): ReactNode {
  const tree: RenderableTreeNode = Markdoc.transform(node, config);
  return Markdoc.renderers.react(tree, React, { components });
}

/** Whether a Markdoc document has any content worth rendering. */
export function hasContent(node: Node | null | undefined): node is Node {
  return !!node && node.children.length > 0;
}

type MarkdocContentProps = {
  node: Node | null | undefined;
  className?: string;
};

/** Typography for rich text (the @tailwindcss/typography plugin, themed in globals.css). */
export const proseClass =
  "prose prose-site max-w-none prose-headings:font-display prose-a:underline-offset-2 hover:prose-a:text-primary-hover prose-img:my-6";

/** Renders a Keystatic Markdoc body with the site typography. */
export function MarkdocContent({ node, className = "" }: MarkdocContentProps) {
  if (!hasContent(node)) return null;
  return <div className={`${proseClass} ${className}`}>{renderMarkdoc(node)}</div>;
}
