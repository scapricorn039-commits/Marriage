import { Experience } from "@/components/Experience";
import { Story } from "@/components/sections/Story";
import { Moments } from "@/components/sections/Moments";
export default function FriendsPage() { return <Experience audience="friends" story={<Story />} moments={<Moments />} />; }
