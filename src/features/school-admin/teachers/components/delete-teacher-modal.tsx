import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { OtpInput } from '@/components/ui/otp-input';
import {
  useConfirmTeacherDelete,
  useRequestTeacherDelete,
} from '@/features/school-admin/teachers/api/mutations';
import { toApiError } from '@/lib/api/errors';

const CODE_LENGTH = 6;

interface DeleteTeacherModalProps {
  teacherId: string;
  teacherName: string;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * Two-step delete behind an emailed code — `frontend-integration.md` §4.4.
 * Never cascades: assessments this teacher authored survive with the
 * author cleared, so the confirmation only warns about the login itself.
 */
export function DeleteTeacherModal({
  teacherId,
  teacherName,
  onClose,
  onDeleted,
}: DeleteTeacherModalProps) {
  const [code, setCode] = useState('');
  const request = useRequestTeacherDelete();
  const confirm = useConfirmTeacherDelete();

  const requested = request.isSuccess;

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete teacher account"
      description={`This removes ${teacherName}'s login. Assessments they authored stay, with the author cleared. This cannot be undone.`}
    >
      {!requested ? (
        <div className="space-y-5">
          {request.isError && (
            <p role="alert" className="text-koyi-danger text-sm">
              {toApiError(request.error).message}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              isLoading={request.isPending}
              onClick={() => {
                request.mutate(teacherId);
              }}
            >
              Send confirmation code
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <OtpInput
            label="Confirmation code"
            length={CODE_LENGTH}
            value={code}
            onChange={setCode}
            onComplete={(value) => {
              confirm.mutate({ teacherId, code: value }, { onSuccess: onDeleted });
            }}
            disabled={confirm.isPending}
            error={confirm.isError ? toApiError(confirm.error).message : undefined}
          />
        </div>
      )}
    </Modal>
  );
}
