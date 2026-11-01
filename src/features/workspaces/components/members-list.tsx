"use client"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Fragment } from "react"

import { useWorkspaceId } from "../hooks/use-workspace-id"
import { useConfirm } from "@/hooks/use-confirm"
import { DottedSeparator } from "@/components/dotted-separator"
import { useGetMembers } from "@/features/members/api/use-get-members"
import { MembersAvatar } from "@/features/members/components/members-avatar"
import { useDeleteMember } from "@/features/members/api/use-delete-member"
import { useUpdateMember } from "@/features/members/api/use-update-member"
import { MemberRole } from "@/features/members/types"

export const MembersList = () => {
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove Member",
        "This member will be removed from the workspace",
        "destructive"
    )
    const workspaceId = useWorkspaceId()

    const { data } = useGetMembers({ workspaceId })
    const {
        mutate: deleteMember,
        isPending: isDeletingMember
    } = useDeleteMember()

    const {
        mutate: updateMember,
        isPending: isUpdatingMember
    } = useUpdateMember()

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        updateMember({
            json: { role },
            param: { memberId }
        })
    }

    const handleDeleteMember = async (memberId: string) => {
        const ok = await confirm()
        deleteMember({ param: { memberId } }, {
            onSuccess: () => {
                window.location.reload()
            }
        })
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <ConfirmDialog />
            <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                <Button variant="secondary" size="sm" asChild>
                    <Link href={`/workspaces/${workspaceId}`}>
                        <ArrowLeftIcon />
                        Back
                    </Link>
                </Button>
                <CardTitle className="tex-xl font-bold">
                    Members List
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator />
            </div>
            <CardContent className="p-7">
                {data?.documents.map((member, index) => (
                    <Fragment key={member.$id}>
                        <div className="flex items-center gap-2">
                            <MembersAvatar
                                className="size-10"
                                fallbackClassName="text-lg"
                                name={member.name}
                            />
                            <div className="flex flex-col">
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="ml-auto"
                                        variant="secondary"
                                        size="icon"
                                    >
                                        <MoreVerticalIcon className="size-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="bottom" align="end">
                                    <DropdownMenuItem
                                        className="font-medium"
                                        onClick={() => { handleUpdateMember(member.$id, MemberRole.ADMIN) }}
                                        disabled={isUpdatingMember}
                                    >
                                        Set as Administrator
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="font-medium"
                                        onClick={() => { handleUpdateMember(member.$id, MemberRole.MEMBER) }}
                                        disabled={isUpdatingMember}
                                    >
                                        Set as Member
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="font-medium text-amber-700"
                                        onClick={() => { handleDeleteMember(member.$id) }}
                                        disabled={isDeletingMember}
                                    >
                                        Remove {member.name}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {index < data.documents.length - 1 && (
                            <Separator className="my-2.5" />
                        )}
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    )
}