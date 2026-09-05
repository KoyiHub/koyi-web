import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { OtpInput } from '@/components/ui/otp-input';
import {
  useConfirmStudentDelete,
  useRequestStudentDelete,
} from '@/features/school-admin/students/api/mutations';
import { toApiError } from '@/lib/api/errors';

const CODE_LENGTH = 6;

interface DeleteStudentModalProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
  onDeleted: () => void;
}

/** Two-step delete behind an emailed code — `frontend-integration.md` §4.5. */
export function DeleteStudentModal({
  studentId,
  studentName,
  onClose,
  onDeleted,
}: DeleteStudentModalProps) {
  const [code, setCode] = useState('');
  const request = useRequestStudentDelete();
  const confirm = useConfirmStudentDelete();

  const requested = request.isSuccess;

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete student record"
      description={`This permanently removes ${studentName}'s record from your school. This cannot be undone.`}
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
                request.mutate(studentId);
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
              confirm.mutate({ studentId, code: value }, { onSuccess: onDeleted });
            }}
            disabled={confirm.isPending}
            error={confirm.isError ? toApiError(confirm.error).message : undefined}
          />
        </div>
      )}
    </Modal>
  );
}
