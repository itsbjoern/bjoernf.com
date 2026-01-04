// https://github.com/nygardk/react-share/tree/master/src

type TemplateProps = {
  title: string;
  url: string;
  summary?: string;
  tags: string[];
};

const template = ({
  title,
  url,
  tags,
  summary,
  type,
}: TemplateProps & {
  type: string;
}) => {
  let add = "\n";
  if (tags?.length) {
    add += ""
    if (tags.length === 1) {
      add += `[${tags[0]}]`;
    } else {
      const copy = [...tags];
      const last = copy.splice(tags.length - 2, 1);
      add += `[${copy.join(", ") + " and " + last}]`;
    }
    add += " by Björn Friedrichs"
  }

  return `${title}
${summary}

${url}
${add}`;
};

const objectToGetParams = (object: Record<string, string | undefined>) => {
  const params = Object.entries(object)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );

  return params.length > 0 ? `?${params.join("&")}` : "";
};

export const linkedinLink = (input: TemplateProps) => {
  const templated = template({ type: "linkedin", ...input });
  return (
    "https://www.linkedin.com/feed/?shareActive=true&text=" +
    encodeURIComponent(templated)
  );
};

export const emailLink = (input: TemplateProps) => {
  const templated = template({ type: "email", ...input });
  return (
    "mailto:" + objectToGetParams({ subject: input.title, body: templated })
  );
};

export const whatsappLink = (input: TemplateProps, mobile: boolean) => {
  const templated = template({ type: "whatsapp", ...input });
  return (
    "https://" +
    (mobile ? "api" : "web") +
    ".whatsapp.com/send" +
    objectToGetParams({
      text: templated,
    })
  );
};

export const xComLink = (input: TemplateProps) => {
  const templated = template({ type: 'x.com', ...input });
  return (
    "https://x.com/share" +
    objectToGetParams({
      text: templated,
      related: undefined,
    })
  );
};
