import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";
import { Card, CardBody } from "@nextui-org/card";

import { siteConfig } from "@/config/site";
import { subtitle, title } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";
import { FormTask } from "@/modules/tasks/components/FormTask.tsx";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Medicifit&nbsp;</h1>
          <h1 className={title({ color: "violet" })}>To-Do&nbsp;</h1>
          <br />
          <h1 className={subtitle()}>Prueba técnina</h1>
        </div>
        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.githubFrontend}
          >
            <GithubIcon size={20} />
            GitHub Frontend
          </Link>
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href={siteConfig.links.githubBackend}
          >
            <GithubIcon size={20} />
            GitHub Backend
          </Link>
        </div>

        <div className="mt-8 w-[80%]">
          <Card className="w-full">
            <CardBody>
              <FormTask />
            </CardBody>
          </Card>
        </div>
      </section>
    </DefaultLayout>
  );
}
