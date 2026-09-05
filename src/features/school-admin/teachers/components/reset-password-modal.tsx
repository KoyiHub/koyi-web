import { Button } from '@/components/ui/button';
import { CheckCircleIcon } from '@/components/ui/icons';
import { Modal } from '@/components/ui/modal';
import { useResetTeacherPassword } from '@/features/school-admin/teachers/api/mutations';
import { toApiError } from '@/lib/api/errors';

interface ResetPasswordModalProps {
  teacherId: string;
  teacherName: string;
  onClose: () => void;
}

/**
 * Password reset — `frontend-integration.md` §4.4: "Email them a reset."
 * The server owns generating and delivering the credential; nothing about
 * it ever reaches this screen, so there is nothing left to choose here
 * beyond confirming the send.
 */
export function ResetPasswordModal({ teacherId, teacherName, onClose }: ResetPasswordModalProps) {
  const resetPassword = useResetTeacherPassword();

  return (
    <Modal
      open
      onClose={onClose}
      title="Reset password"
      description={`Email ${teacherName} a link to set a new password. Their current password stops working once they use it.`}
    >
      {resetPassword.isSuccess ? (
        <div className="space-y-4">
          <div className="bg-koyi-band-strong-soft rounded-koyi-lg flex items-start gap-3 p-4">
            <CheckCircleIcon className="text-koyi-band-strong-ink mt-0.5 size-5 shrink-0" />
            <p className="text-koyi-text text-sm">
              Reset link emailed to {teacherName}. Their current password stays active until they
              use it.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Done</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {resetPassword.isError && (
            <p role="alert" className="text-koyi-danger text-sm">
              {toApiError(resetPassword.error).message}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              isLoading={resetPassword.isPending}
              onClick={() => {
                resetPassword.mutate(teacherId);
              }}
            >
              Send reset link
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
