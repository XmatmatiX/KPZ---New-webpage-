class ProjectNotAvailableException(Exception):
    "Projekt nie jest dostepny"
    pass


class GroupSizeExccededException(Exception):
    "Rozmiar grupy osiagnal maksimum i nie mozna dodawac wiecej uzytkownikow"
    pass


class MinimumSizeGroupException(Exception):
    "Grupa musi posiadac co najmniej jednego uzytkownika"
    pass


class LeaderException(Exception):
    "Lider grupy nie moze jej opuscisc, chyba ze jest jej jedynym czlonkiem"
    pass


class AssignedProjectException(Exception):
    "Projekt posiada rezerwacje i nie moze zostac usuniety"
    pass


class GroupWithReservation(Exception):
    "Sklad grupy z rezerwacja nie moze zostac zmieniony"
    pass

class DeleteGroupException(Exception):
    "Grupa nie moze zostac usunieta"
    pass

class GuardianAssignedException(Exception):
    "Opiekun jest przypisany do grupy i nie moze zostac usuniety"
    pass

class GroupSizeNotValidForProjectException(Exception):
    "Rozmiar grupy nie odpowiada wymaganiom projektu"
    pass


class NotTimeForReservationException(Exception):
    "Nie mozna dokonac rezerwacji, poniewaz czas na zapisy jeszcze nie nadszedl"
    pass