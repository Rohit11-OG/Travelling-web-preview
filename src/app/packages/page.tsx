import { getPackages } from "../../lib/packages";
import PackagesBrowser from "./PackagesBrowser";

export default async function PackagesPage() {
  return <PackagesBrowser allPackages={await getPackages()} />;
}
