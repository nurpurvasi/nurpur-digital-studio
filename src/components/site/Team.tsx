import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Facebook, Instagram, Linkedin, Mail, Phone, UserRound } from "lucide-react";
import { listFeaturedTeam, listPublicTeam, type TeamMember } from "@/lib/team.functions";
import { Reveal } from "@/components/site/Reveal";
import { AddPlaceholder } from "@/components/site/AddPlaceholder";

/**
 * Reusable Team section. Designed to drop into any future template
 * (school, hotel, hospital, business, NGO, restaurant, real estate)
 * by swapping the eyebrow/title/subtitle and `variant`.
 */
export type TeamVariant = "featured" | "all";

export function Team({
  variant = "featured",
  eyebrow = "Our Team",
  title = "The people behind the work",
  subtitle,
  columns = 4,
  showEmpty = true,
  className = "",
}: {
  variant?: TeamVariant;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  columns?: 2 | 3 | 4;
  showEmpty?: boolean;
  className?: string;
}) {
  const fetchFeatured = useServerFn(listFeaturedTeam);
  const fetchAll = useServerFn(listPublicTeam);

  const { data } = useQuery({
    queryKey: ["team-public", variant],
    queryFn: () => (variant === "featured" ? fetchFeatured() : fetchAll()),
  });

  const members = (data?.items ?? []) as TeamMember[];

  if (members.length === 0 && !showEmpty) return null;

  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className={`relative py-24 sm:py-32 ${className}`} aria-labelledby="team-heading">
      <div className="mx-auto max-w-[1200px] px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              {eyebrow}
            </p>
            <h2
              id="team-heading"
              className="mt-4 text-4xl font-normal tracking-tight sm:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h2>
            {subtitle && <p className="mt-4 text-base text-muted-foreground">{subtitle}</p>}
          </div>
        </Reveal>

        <div className={`mt-14 grid gap-6 ${cols}`}>
          {members.length === 0 ? (
            <>
              {Array.from({ length: columns }).map((_, i) => (
                <AddPlaceholder key={i} label="Add Team Member" aspect="4 / 5" />
              ))}
            </>
          ) : (
            members.map((m, i) => (
              <Reveal key={m.id} delay={i * 60}>
                <TeamCard member={m} />
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  const s = member.social_links ?? {};
  return (
    <article className="group h-full overflow-hidden rounded-3xl border border-border/70 bg-white/70 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_40px_80px_-40px_color-mix(in_oklab,var(--royal)_35%,transparent)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {member.profile_image ? (
          <img
            src={member.profile_image}
            alt={member.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <UserRound className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold tracking-tight">{member.name}</h3>
        {member.designation && (
          <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
            {member.designation}
          </p>
        )}
        {member.bio && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {member.bio}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {member.email && (
            <SocialLink href={`mailto:${member.email}`} label={`Email ${member.name}`}>
              <Mail className="h-3.5 w-3.5" />
            </SocialLink>
          )}
          {member.phone && (
            <SocialLink href={`tel:${member.phone}`} label={`Call ${member.name}`}>
              <Phone className="h-3.5 w-3.5" />
            </SocialLink>
          )}
          {s.linkedin && (
            <SocialLink href={s.linkedin} label={`${member.name} on LinkedIn`} external>
              <Linkedin className="h-3.5 w-3.5" />
            </SocialLink>
          )}
          {s.instagram && (
            <SocialLink href={s.instagram} label={`${member.name} on Instagram`} external>
              <Instagram className="h-3.5 w-3.5" />
            </SocialLink>
          )}
          {s.facebook && (
            <SocialLink href={s.facebook} label={`${member.name} on Facebook`} external>
              <Facebook className="h-3.5 w-3.5" />
            </SocialLink>
          )}
          {s.x && (
            <SocialLink href={s.x} label={`${member.name} on X`} external>
              <span className="text-[11px] font-semibold leading-none">X</span>
            </SocialLink>
          )}
        </div>
      </div>
    </article>
  );
}

function SocialLink({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-white text-foreground/70 transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md"
    >
      {children}
    </a>
  );
}
