class ProjectNotAvailableException(Exception):
    "The project is not available"
    pass


class GroupSizeExccededException(Exception):
    "The group size is exceeded"
    pass


class MinimumSizeGroupException(Exception):
    "The group must have at least one member"
    pass


class LeaderException(Exception):
    "The leader of the group cant leave a group unless the group has no other member"
    pass


class AssignedProjectException(Exception):
    "The assigned project cant be deleted"
    pass


class GroupWithReservation(Exception):
    "The group with reservation can not be changed"
    pass

class DeleteGroupException(Exception):
    "The group cannot be deleted"
    pass

class GuardianAssignedException(Exception):
    "The guardian is assigned to a group and cannot be deleted"
    pass

class GroupSizeNotValidForProjectException(Exception):
    "The group size is not valid for project"
    pass


class NotTimeForReservationException(Exception):
    "Time for subscribtion has yet to come"
    pass